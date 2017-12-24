
using Roc.Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Roc.Uility;
using System.Web.Mvc;
using Roc.Application.SystemManage;
using Roc.Model.Entity.SystemManage;

namespace Roc.Web.Controllers
{

    public class OrderServiceXController : ControllerBase
    {

        [System.Web.Http.HttpPost]
        public JsonResult CommitOrder(OrderTempModel data)
        {
            FileLog.Info("-----------------------"+data.ToJson());
            OrderApp orderApp = new OrderApp();
            OrderEntity orderEntity = new OrderEntity();
            orderEntity.F_Total = data.productprice.ToDecimal();
            orderEntity.F_Count = data.count.ToInt();
            orderEntity.F_UserName = data.username;
            orderEntity.F_UserTelphone = data.phone;
            orderEntity.F_Address = data.area;
            orderEntity.F_ShortAddress = data.address;
            orderEntity.F_PayType = data.paytype.ToInt();
            orderEntity.F_Remark = data.remark;
            orderApp.SubmitForm(orderEntity, null, "");
             
            return AjaxSuccess("恭喜您！订单已经生成我们会在收到订单后第一时间联系您！请耐心等待！");
        }

    }
}
