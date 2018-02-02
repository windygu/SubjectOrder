//-----------------------------------------------------------------------
// <copyright file=" Order.cs" company="NFine">
// * Copyright (C) NFine.Framework  All Rights Reserved
// * version : 1.0
// * author  : NFine.Framework
// * FileName: Order.cs
// * history : Created by T4 12/21/2017 23:14:54 
// </copyright>
//-----------------------------------------------------------------------
using System;
using Roc.Data;

namespace Roc.Model.Entity.SystemManage
{
   [Table("Sys_Order")]
    public class OrderEntity : IEntity<OrderEntity>, ICreationAudited, IDeleteAudited, IModificationAudited
    {
        [Key]
        public String F_Id { get; set; }
        public String F_UserName { get; set; }
        public String F_UserTelphone { get; set; }
        public String F_Address { get; set; }
        public string F_ShortAddress { set; get; }
        public Decimal? F_Total { get; set; }
        public Int32? F_PayType { get; set; }
        
        public Int32? F_OrderType { get; set; }
        public string F_Source { set; get; }
        public Int32? F_Count { get; set; }
        public int F_Status { set; get; }
        public int F_TalkStatus { set; get; }
        public int F_ProductId { set; get; }
        public string F_ProductName { set; get; }
        public String F_Remark { get; set; }
        public Boolean? F_DeleteMark { get; set; }
        public Boolean? F_EnabledMark { get; set; }
        public String F_Description { get; set; }
        public DateTime? F_CreatorTime { get; set; }
        public String F_CreatorUserId { get; set; }
        public DateTime? F_LastModifyTime { get; set; }
        public String F_LastModifyUserId { get; set; }
        public DateTime? F_DeleteTime { get; set; }
        public String F_DeleteUserId { get; set; }
    }
}