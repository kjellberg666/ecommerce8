using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity
{
    public class AppIdentityDbContextSeed
    {
        public static async Task SeedUserAsync(UserManager<AppUser> userManager)
        {
            if (!userManager.Users.Any())
            {
                var user = new AppUser
                {
                    DisplayName = "Öykü",
                    Email = "oyku.yener99@gmail.com",
                    UserName = "oyku.yener",
                    Role = "Admin",
                    Address = new Address
                    {
                        FirstName = "Öykü",
                        LastName = "Yener",
                        Street = "7. cadde",
                        City = "Ankara",
                        ZipCode = "06200"
                    }
                };

                await userManager.CreateAsync(user, "Pa$$w0rd");
            }
        }
    }
}