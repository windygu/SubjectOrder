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
        [HttpPost]
        [HandlerAuthorize]
        [HandlerAjaxOnly]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteForm(string keyValue)
        {
            orderApp.DeleteForm(keyValue);
            return Success("删除成功。");
        }
        [HttpPost]
        [HandlerAjaxOnly]
        [HandlerAuthorize]
        [ValidateAntiForgeryToken]
        public ActionResult StartTalk(string keyValue)
        {
           var orderEntity = orderApp.GetForm(keyValue);
            orderEntity.F_Id = keyValue;
            orderEntity.F_TalkStatus = 1;
            orderApp.UpdateForm(orderEntity);
            return Success("设置状态成功。");
        }
        [HttpPost]
        [HandlerAjaxOnly]
        [HandlerAuthorize]
        [ValidateAntiForgeryToken]
        public ActionResult StartSendPackage(string keyValue)
        {
            var orderEntity = orderApp.GetForm(keyValue);
            orderEntity.F_Id = keyValue;
            orderEntity.F_OrderType = 1;
            orderApp.UpdateForm(orderEntity);
            return Success("设置状态成功。");
        }
    }
}
