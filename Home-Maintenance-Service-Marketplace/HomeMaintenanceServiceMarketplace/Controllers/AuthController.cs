using Microsoft.AspNetCore.Mvc;

namespace HomeMaintenanceServiceMarketplace.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
