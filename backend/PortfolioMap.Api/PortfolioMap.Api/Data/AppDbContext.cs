using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<University> Universities => Set<University>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProjectTag> ProjectTags => Set<ProjectTag>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ProjectTag>()
            .HasKey(pt => new { pt.ProjectId, pt.TagId });

        builder.Entity<Project>(e =>
        {
            e.Property(p => p.Title).HasMaxLength(200).IsRequired();
            e.Property(p => p.Type).HasMaxLength(20);
            e.Property(p => p.Status).HasMaxLength(20);
            e.Property(p => p.Location).HasColumnType("geography");
        });

        builder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();
    }
}