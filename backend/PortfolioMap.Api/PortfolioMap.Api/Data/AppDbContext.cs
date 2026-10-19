using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Models;
using Microsoft.AspNetCore.Identity;
namespace PortfolioMap.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<University> Universities => Set<University>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProjectTag> ProjectTags => Set<ProjectTag>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<CompanyProfile> CompanyProfiles => Set<CompanyProfile>();
    public DbSet<SavedProject> SavedProjects => Set<SavedProject>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

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

        builder.Entity<StudentProfile>(e =>
        {
            e.HasKey(s => s.UserId);
            e.HasOne(s => s.User).WithOne()
                .HasForeignKey<StudentProfile>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.University).WithMany()
                .HasForeignKey(s => s.UniversityId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(s => s.Major).HasMaxLength(100);
            e.Property(s => s.GithubUrl).HasMaxLength(300);
            e.Property(s => s.LinkedInUrl).HasMaxLength(300);
        });

        builder.Entity<CompanyProfile>(e =>
        {
            e.HasKey(c => c.UserId);
            e.HasOne(c => c.User).WithOne()
                .HasForeignKey<CompanyProfile>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(c => c.CompanyName).HasMaxLength(200).IsRequired();
            e.Property(c => c.Website).HasMaxLength(300);
            e.Property(c => c.Address).HasMaxLength(300);
            e.Property(c => c.LogoUrl).HasMaxLength(500);
        });

        builder.Entity<SavedProject>(e =>
        {
            e.HasKey(sp => new { sp.UserId, sp.ProjectId });
            e.HasOne(sp => sp.User).WithMany()
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(sp => sp.Project).WithMany()
                .HasForeignKey(sp => sp.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ContactMessage>(e =>
        {
            e.Property(c => c.Subject).HasMaxLength(200).IsRequired();
            e.Property(c => c.Content).HasMaxLength(2000).IsRequired();
            e.HasOne(c => c.FromUser).WithMany()
                .HasForeignKey(c => c.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.ToUser).WithMany()
                .HasForeignKey(c => c.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Project).WithMany()
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(c => c.ToUserId);
        });
    }
}