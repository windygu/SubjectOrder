using Roc.Application.SystemManage;
using Roc.Model.Entity.SystemManage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;

namespace Roc.Web.Controllers
{
    public class ZtOrder
    {
        public string username { set; get; }
        public string userphone { set; get; }
            
    }
    public class AjaxResponse
    {
        public string status { set; get; }
        public string message { set; get; }
    }
    public class OrderServiceController : Controller
    {
  
        [System.Web.Http.HttpPost]
        public JsonResult CommitOrder(ZtOrder data)
        {
            var res = new AjaxResponse();
            res.status = "1";
            res.message = "提交成功";
            OrderApp orderApp = new OrderApp();
            OrderEntity userEntity = new OrderEntity();
            userEntity.F_UserName = data.username;
            userEntity.F_UserTelphone = data.userphone;
            orderApp.SubmitForm(userEntity, null, "");
            return Json(res,JsonRequestBehavior.AllowGet);
        }
         
    }
}