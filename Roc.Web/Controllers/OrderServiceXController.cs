
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
using System.Web;
using System.IO;
using Roc.Data;
namespace Roc.Web.Controllers
{

    public class OrderServiceXController : ControllerBase
    {

        [System.Web.Http.HttpPost]
        public JsonResult CommitOrder(OrderTempModel data)
        {
            FileLog.Info("-----------------------" + data.ToJson());
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
            orderEntity.F_Source = HttpUtility.UrlDecode(data.source);
            orderEntity.F_ProductName = data.productname;
            orderApp.SubmitForm(orderEntity, null, "");
            if (!ValidateSmsInDb(data.phone, data.code))
            {
                return AjaxError("验证码不正确，请重新输入");
            }
            return AjaxSuccess("恭喜您！订单已经生成我们会在收到订单后第一时间联系您！请耐心等待！");
        }

        [System.Web.Http.HttpPost]
        public JsonResult ValidateCode()
        {
            string requestPhone = Request["phone"];
            if (string.IsNullOrWhiteSpace(requestPhone))
            {
                return null;
            }
            string un = "N7841713";
            string pw = "aq6G7Vkhb";
            string phone = requestPhone;
            var code = GeneratorSMSCode();
            string content = Server.UrlEncode(string.Format("亲爱的用户，您的短信验证码为{0}，5分钟内有效，若非本人操作请忽略。【甄实公司】", code));


            string postJsonTpl = "\"account\":\"{0}\",\"password\":\"{1}\",\"phone\":\"{2}\",\"report\":\"false\",\"msg\":\"{3}\"";
            string jsonBody = string.Format(postJsonTpl, un, pw, phone, content);


            string result = doPostMethodToObj("http://vsms.253.com/msg/send/json", "{" + jsonBody + "}");//请求地址请登录253云通讯自助通平台查看或者询问您的商务负责人获取
            if (string.IsNullOrWhiteSpace(result))
            {
                return Json(Error("发送短信失败"), JsonRequestBehavior.AllowGet);
            }
            var responseData = Roc.Uility.Json.ToObject<dynamic>(result);
            // "{\"time\":\"20180128223027\",\"msgId\":\"18012822302727680\",\"errorMsg\":\"\",\"code\":\"0\"}"
            if (responseData.code == "0")
            {
                TakeSmsIntoDb(requestPhone, code);
                return AjaxSuccess("成功");
            }
            return null;
        }
        public static string doPostMethodToObj(string url, string jsonBody)
        {
            string result = String.Empty;
            HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
            httpWebRequest.ContentType = "application/json";
            httpWebRequest.Method = "POST";

            // Create NetworkCredential Object 
            NetworkCredential admin_auth = new NetworkCredential("username", "password");

            // Set your HTTP credentials in your request header
            httpWebRequest.Credentials = admin_auth;

            // callback for handling server certificates
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

            using (StreamWriter streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                streamWriter.Write(jsonBody);
                streamWriter.Flush();
                streamWriter.Close();
                HttpWebResponse httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (StreamReader streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }
            }
            return result;
        }
        int GeneratorSMSCode()
        {
            Random rad = new Random();
            int mobile_code = rad.Next(1000, 10000);
            return mobile_code;
        }
        bool TakeSmsIntoDb(string phone, int code)
        {

            var conn = DbHelper.GetInstance().CreateConnection("");
            var sql = "insert into Sys_SMSLog(F_Id,F_Phone,F_Code)values('" + Guid.NewGuid() + "','" + phone + "'," + code + ")";
            conn.Execute(sql);
            return true;
        }
        bool ValidateSmsInDb(string phone, string code)
        {

            var conn = DbHelper.GetInstance().CreateConnection("");
            var sql = "select top 1 * from Sys_SMSLog where F_Phone='" + phone + "' and F_UserStatus=0 order by F_CreatorTime desc";
     
            var reader = conn.ExecuteReader(sql);

            if (!reader.Read())
            {
                return false;
            }
            var smsCode = reader["F_Code"].ToString();
            var smdId = reader["F_Id"].ToString();
            if (!reader.IsClosed)
            {
                reader.Close();
            }
            if (string.IsNullOrWhiteSpace(smsCode) || string.IsNullOrWhiteSpace(code))
            {
                return false;
            }
            if (smsCode != code)
            {
                return false;
            }
            else
            {
                var sql2 = "update Sys_SMSLog set F_UserStatus=1 where F_Id='" + smdId+"'";
                conn.Execute(sql2);
            }
            if (conn.State==System.Data.ConnectionState.Open)
            {
                conn.Close();
            }
            return true;
        }
    }
}
