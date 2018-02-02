using Roc.Uility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Roc.Web.Controllers
{
    public class p2Controller : Controller
    {
        //
        // GET: /p1/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Hj()
        {
            return View();
        }
        public ActionResult pwd()
        {
            var a = Md5.md5(Common.CreateNo(), 16).ToLower();
            var p = Md5.md5(DESEncrypt.Encrypt(Md5.md5("xyadvip888", 32).ToLower(), a).ToLower(), 32).ToLower();
            return Content(p);
        }
        public ActionResult pzhj()
        {
            return View();
        }
    }
}
