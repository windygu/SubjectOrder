﻿/*******************************************************************************
    * Copyright 2016 Roc.Framework 版权所有
    * Author: Roc Ching
    * Description: Roc 快速开发平台
    * Date：2016-09-12
    *********************************************************************************/
using Roc.Data;
using Roc.Model.Entity.SystemManage;
using Roc.Model.IRepository.SystemManage;
using Roc.Repository.SystemManage;
using System.Collections.Generic;

namespace Roc.Repository.SystemManage
{
    public class ModuleButtonRepository : RepositoryBase<ModuleButtonEntity>, IModuleButtonRepository
    {
        public void SubmitCloneButton(List<ModuleButtonEntity> entitys)
        {
            base.Insert(entitys);
        }
    }
}
