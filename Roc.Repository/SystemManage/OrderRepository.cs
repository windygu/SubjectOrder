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
using Roc.Model.IRepository.SystemManage;
using Roc.Repository.SystemManage;
using Roc.Uility;
using System;

namespace Roc.Repository.SystemManage
{
    public class OrderRepository : RepositoryBase<OrderEntity>, IOrderRepository
    {
        public void DeleteForm(string keyValue)
        {
            throw new System.NotImplementedException();
        }

        public void SubmitForm(OrderEntity orderEntity, UserLogOnEntity userLogOnEntity, string keyValue)
        {
            using (var db = base.Connection)
            {
                db.Open();
                var tran = db.BeginTransaction();
                try
                {
                    if (!string.IsNullOrEmpty(keyValue))
                    {
                        var sql = base.GetSqlLam().Update(orderEntity).Where(m => m.F_Id == keyValue);
                        db.Execute(sql.SqlString, sql.Parameters, tran);
                    }
                    else
                    {
                      
                        var sql = base.GetSqlLam().Insert(orderEntity);
                        db.Execute(sql.SqlString, sql.Parameters, tran);

                     
                    }
                    tran.Commit();
                    
                }
                catch(Exception ex)
                {
                    tran.Rollback();
                }
            }
        }
    }
}