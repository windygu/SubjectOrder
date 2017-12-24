//-----------------------------------------------------------------------
// <copyright file=" Order.cs" company="NFine">
// * Copyright (C) NFine.Framework  All Rights Reserved
// * version : 1.0
// * author  : NFine.Framework
// * FileName: Order.cs
// * history : Created by T4 12/21/2017 23:14:55 
// </copyright>
//-----------------------------------------------------------------------
using Roc.Data;
using Roc.Model.Entity.SystemManage;

namespace Roc.Model.IRepository.SystemManage
{
    public interface IOrderRepository : IRepositoryBase<OrderEntity>
    {
        void DeleteForm(string keyValue);
        void SubmitForm(OrderEntity userEntity, UserLogOnEntity userLogOnEntity, string keyValue);
    }
}