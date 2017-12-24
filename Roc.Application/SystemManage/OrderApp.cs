//-----------------------------------------------------------------------
// <copyright file=" Order.cs" company="NFine">
// * Copyright (C) NFine.Framework  All Rights Reserved
// * version : 1.0
// * author  : NFine.Framework
// * FileName: Order.cs
// * history : Created by T4 12/21/2017 23:14:54 
// </copyright>
//-----------------------------------------------------------------------

using Roc.Model.Entity.SystemManage;
using Roc.Model.IRepository.SystemManage;
using Roc.Repository.SystemManage;
using Roc.Uility;
using System;
using System.Collections.Generic;
using System.Linq;
namespace Roc.Application.SystemManage
{
    public class OrderApp
    {
		private IOrderRepository service = new OrderRepository();

		public List<OrderEntity> GetList(Pagination pagination, string queryJson)
        {
            return service.GetList().OrderBy(t => t.F_CreatorTime).ToList();
        }

	    public OrderEntity GetForm(string keyValue)
        {
            return service.Get(m => m.F_Id == keyValue);
        }
        public void SubmitForm(OrderEntity orderEntity, UserLogOnEntity userLogOnEntity, string keyValue)
        {
            if (!string.IsNullOrEmpty(keyValue))
            {
                orderEntity.Modify(keyValue);
            }
            else
            {
                orderEntity.Create();
            }
            service.SubmitForm(orderEntity, userLogOnEntity, keyValue);
        }
    }
}