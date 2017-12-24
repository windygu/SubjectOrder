using Roc.Application.SystemManage;
using Roc.Model.Entity.SystemManage;
using Roc.Uility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
namespace Roc.Web.Areas.SystemManage.Controllers
{
    public class OrderController : ControllerBase
    {

        OrderApp orderApp = new OrderApp();

        [HttpGet]
        [HandlerAjaxOnly]
        public ActionResult GetGridJson(Pagination pagination, string keyword)
        {
            base.FileLog.Info(pagination);
            var data = new
            {
                rows = orderApp.GetList(pagination, keyword),
                total = pagination.total,
                page = pagination.page,
                records = pagination.records
            };
            return Content(data.ToJson());
        }
        [HttpPost]
        [HandlerAjaxOnly]
        [ValidateAntiForgeryToken]
        public ActionResult SubmitForm(OrderEntity userEntity, UserLogOnEntity userLogOnEntity, string keyValue)
        {
            orderApp.SubmitForm(userEntity, userLogOnEntity, keyValue);
            return Success("操作成功。");
        }
    }
}
