using Microsoft.AspNetCore.Mvc;

namespace HomeMaintenanceServiceMarketplace.Controllers
{
    public class UserController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
