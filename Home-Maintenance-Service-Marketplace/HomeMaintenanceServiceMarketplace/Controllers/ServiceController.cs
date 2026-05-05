using Microsoft.AspNetCore.Mvc;

namespace HomeMaintenanceServiceMarketplace.Controllers
{
    public class ServiceController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
