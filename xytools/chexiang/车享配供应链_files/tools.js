;(function( $, tools ){

    //通用表格多选效果
    tools.tableCheck = function( $table ){

        //表格内部单选
        $table.on( 'click', 'td>strong>.checker>span>input[type="checkbox"]',function(){
              var $span = $(this).parent();
              var $tr = $(this).closest("tr");
              if( $(this).prop("checked")){
                  $tr.addClass("active");
                  $span.addClass("checked");
              }else{
                  $tr.removeClass("active");
                  $span.removeClass("checked");
              }
        });

        //表格头部全选
        $table.on( 'click', 'th input[type="checkbox"]', function(){
              var $tr = $(this).closest("table").find("tbody tr");
              var $span = $(this).closest("table").find("tr .checker span");
              var $allRadio = $(this).closest("table").find("tbody :checkbox");
              if( $(this).prop("checked") ){
                  //$tr.addClass("active");
                  $span.addClass("checked");
                  $allRadio.prop("checked", true);
              }else{
                  //$tr.removeClass("active");
                  $span.removeClass("checked");
                  $allRadio.prop("checked", false);
              }
        });
    }

    //fromTable:需要克隆的table， toTable：克隆到的table
    tools.tableClone = function( $fromTable, $toTable, msg ){
        var hasSelected, selectedArr = [], msg = msg || '请选择要添加的项！';
        //取得已选中的ID集合
        $toTable.find( 'tbody>tr :checkbox' ).each(function( index, item ){
            selectedArr.push( $(item).val() );
        });
        //遍历并clone每一行
        $fromTable.find( 'tbody>tr' ).each(function( index, item ){
            if( $(item).find( ':checkbox' ).prop( 'checked' ) ){
                //取得选中的ID
                var id = $.trim( $(item).find( ':checked' ).val() );
                //checkbox已有选中
                hasSelected = true;
                //判断是否已选择过
                if( selectedArr.indexOf( id ) === -1 ){
                    //克隆并去掉选中状态
                    var $clone = $(item).clone();
                    //去掉选中状态
                    $clone.removeClass( 'active' ).find( 'td:eq(0)' ).html( '<input type="checkbox" class="checkboxes" value="'+id+'">' );
                    $clone.find( ':checkbox' ).uniform();
                    //$clone.find( 'td:eq(2), td:eq(3)' ).remove();
                    $toTable.find( 'tbody' ).append( $clone );
                };
            };
        });
        if( !hasSelected ) $.Alert( msg );
        tools.setNum( $toTable );
        return selectedArr;
    };

    //删除某一列
    tools.deletTr = function( $table, msg ){
        var hasSelected, msg = msg || '请选择要删除的列！';
        $table.find( 'tbody>tr' ).each(function( index, item ){
            if( $(item).find( ':checkbox' ).prop( 'checked' ) ){
                $(item).remove();
                //checkbox已有选中
                hasSelected = true;
            };
        });
        //是否已有选中
        if( !hasSelected ) {
            $.Alert( msg );
            return;
        };
        //重新排序
        tools.setNum( $table );
        if( $table.find( 'tbody>tr' ).length == 0 ) $table.find( 'thead :checkbox' ).prop( 'checked', false ).uniform();
    };
    
    tools.setColumnValueFullRow = function(tableId, columnId, value){
        var $table = $( '#'+tableId );
        //获取已经存在的ID
        $table.find("input[id$="+columnId+"]").each(function( index, item ){
        	$(item).val(value);
        });
    }
    
    tools.hideTrNoCheckByItem = function($trItem,$isDel){
    	if($trItem.length > 0){
    		$isDel.val(1);
    		$trItem.hide();
    	}
    };

    //隐藏某一行（table中删除一行，为逻辑删除，所以不能用remove，而是隐藏，并且isDeleted = 1）
    tools.hideTr = function( $table, msg ){
        var hasSelected, msg = msg || '请选择要删除的列！';
        $table.find( 'tbody>tr' ).each(function( index, item ){
            if( $(item).find( ':checkbox' ).prop( 'checked' ) ){
            	var id = $(item).find("input[class='id']").val();
            	if(id){
            		$(item).find("input[class='isDeleted']").val(1);
                    $(item).hide();
            	}else{
            		$(item).remove();
            	}
                //checkbox已有选中
                hasSelected = true;
            };
        });
        //是否已有选中
        if( !hasSelected ) {
            $.Alert( msg );
            return;
        };
        //重新排序
        tools.setNum( $table );
        if( $table.find( 'tbody>tr' ).length == 0 ) $table.find( 'thead :checkbox' ).prop( 'checked', false ).uniform();
    };
    
    //设置table的序号
    tools.setNum = function( $table ){
        $table.find( 'tbody>tr>th' ).each(function( index, item ){
            $(item).text( index+1 );
        });
    };

    /**
     * tableId: table的id
     * trTemplete: 需要添加的tr模板
     * ID：判断是否重复的字段名
     * jsonData: 添加的json数据
     * replaceColumnsArr: 需要替换的字段数组
     * indexId: 传入的索引
     * idList
    */
   

    tools.addRows = function( tableId, trTemplete, id, jsonData, replaceColumnsArr, indexId, isCheckDuplicate, ignoreIdList ){

        var $table = $( '#'+tableId ), 
            selectedArr = [], 
            me = this,
            canRepeatArr = ( ignoreIdList ? ignoreIdList.split(",") : [] );
        me.indexId = indexId || 0;

        //获取已经存在的ID
        $table.find( 'tbody>tr' ).each(function( index, item ){
            selectedArr.push( $(item).attr( 'tr_id' ) );
        });

        //遍历数据，添加未存在的数据
        $.each( jsonData, function( i, obj ){
            //是否需要判重
            if( !isCheckDuplicate ){
                //不在于table中，并且不在忽视列表中
                if( selectedArr.indexOf( obj.id+'' ) === -1 && canRepeatArr.indexOf( obj.id+'' ) === -1 ){
                    var newTrTemplete = trTemplete;
                    $.each( replaceColumnsArr, function( index, item ){
                        var reg =new RegExp('{' + item + '}',"g");
                        newTrTemplete = newTrTemplete.replace( reg, obj[item] );
                        newTrTemplete = newTrTemplete.replace( /{i}/g, me.indexId );
                        newTrTemplete = newTrTemplete.replace( /{id}/g, obj[id] );
                        newTrTemplete = newTrTemplete.replace( 'undefined', '' );
                    });
                    $table.find( 'tbody' ).append( newTrTemplete );
                    me.indexId++;
                };
            };
        });
        return me.indexId;
    };
    
    

    tools.addRowsNoDuplicate = function( tableId, trTemplete, id, jsonData, replaceColumnsArr, indexId, isCheckDuplicate,checkDuplicateIndex, ignoreIdList ){

        var $table = $( '#'+tableId ), 
            selectedArr = [], 
            me = this,
            canRepeatArr = ( ignoreIdList ? ignoreIdList.split(",") : [] );
        me.indexId = indexId || 0;

        var duplicateTr = new CxpMap();
        if(isCheckDuplicate){
            $table.find("input[id$="+replaceColumnsArr[checkDuplicateIndex]+"]").each(function( index, item ){
            	if (!$(item).is(':hidden')){
                	duplicateTr.put($(item).val(),"true");	
            	}
            });
        }
        //获取已经存在的ID
        $table.find( 'tbody>tr' ).each(function( index, item ){
            selectedArr.push( $(item).attr( 'tr_id' ) );
        });
        
        

        //遍历数据，添加未存在的数据
        $.each( jsonData, function( i, obj ){
            //忽略重复行
        	if(isCheckDuplicate && duplicateTr.containsKey(obj[replaceColumnsArr[checkDuplicateIndex]])){
        		return true;
        	}
        	
            //不在于table中，并且不在忽视列表中
            if( selectedArr.indexOf( obj.id+'' ) === -1 && canRepeatArr.indexOf( obj.id+'' ) === -1 ){
                var newTrTemplete = trTemplete;
                $.each( replaceColumnsArr, function( index, item ){
                    var reg =new RegExp('{' + item + '}',"g");
                    newTrTemplete = newTrTemplete.replace( reg, obj[item] );
                    newTrTemplete = newTrTemplete.replace( /{i}/g, me.indexId );
                    newTrTemplete = newTrTemplete.replace( /{id}/g, obj[id] );
                    newTrTemplete = newTrTemplete.replace( 'undefined', '' );
                });
                $table.find( 'tbody' ).append( newTrTemplete );
                me.indexId++;
            };
        });
        return me.indexId;
    };
        
    
    /**
     * tableId: table的id
    */    
    tools.resetIndex = function(tableId){
    	var $table = $( '#'+tableId );
    	$table.find( 'tbody>tr' ).each(function( index, item ){
    			$(item).find(":input").each(function(subIndex,subItem){
    					if($(subItem).attr('id') != undefined && $(subItem).attr('id') != null){
    						var patt1= /\S\[\d+\]\.\S/;
    						var subId = $(subItem).attr('id');
    						if(patt1.test(subId)){
    							var startIndex = subId.lastIndexOf("[");
    							var endIndex = subId.lastIndexOf("]")
    							var subStr = subId.substring(startIndex+1,endIndex);
    							if (subStr == index){
    								return false;
    							}else {
    								var newId = subId.substring(0,startIndex+1) + index  + subId.substring(endIndex,subId.length);
    								$(subItem).attr("id",newId);
    							}
    						}
    					}
    					if($(subItem).attr('name') != undefined && $(subItem).attr('name') != null){
    						var patt1= /\S\[\d+\]\.\S/;
    						var subName = $(subItem).attr('name');
       						if(patt1.test(subName)){
    							var startIndex = subName.lastIndexOf("[");
    							var endIndex = subName.lastIndexOf("]")
    							var subStr = subName.substring(startIndex+1,endIndex);
    							if (subStr == index){
    								return false;
    							}else {
    								var newName = subName.substring(0,startIndex+1) + index  + subName.substring(endIndex,subName.length);
    								$(subItem).attr("name",newName);
    							}
    						}
    					}    				
    			});
    	});
    };

    //取得indexId
    tools.addRows.prototype.getIndexId = function(){
        return this.indexId;
    }

    /**
     * tools.message：单纯的提示弹窗，自动消失
     * time(num)：弹窗多久才消失
     * msg(string): 提示的消息文字
    */
    tools.message = function( msg, time ){
        var msg = msg || '操作成功！',
            time = time || 1500;
        $.Alert(msg);
        $( "#alert_Modal" ).addClass( 'tools-message' ).find( "div.modal-footer" ).remove();
        var t = setTimeout( jQuery.Alert.destoryAlert,time );
    };

    /**
     * tools.formReset：表单重置
     * formId：需要重置的表单ID
     * idList(string)：不需要清空的表单ID字符串列表
     * exp: tools.formReset() || tools.formReset( 'addSupplierForm', 'optionsRadios4,textInput,inlineCheckbox1,textArea' )
    */
    tools.formReset = function( formId, idList ){
        $('body').on('click', ':reset', function(){

            //生成忽略ID数组
            var idArray = idList ? idList.split( ',' ) : [];

            //如果不指定表单ID，则默认为reset按钮所在的表单
            var $form = formId ? $( '#' + formId ) : $(this).closest( 'form' );

            //文本框、文本域重置
            $form.find( 'input:text, textarea' ).filter(function( index ){
                return idArray.indexOf( $(this).prop( 'id' ) ) == -1;
            }).val( '' );

            //单选多选重置
            $form.find( ':radio, :checkbox' ).filter(function( index ){
                return idArray.indexOf( $(this).prop( 'id' ) ) == -1;
            }).prop( 'checked', false ).uniform();

            //select2下拉重置
            $form.find( 'select.select2me' ).filter(function( index ){
                return idArray.indexOf( $(this).prop( 'id' ) ) == -1;
            }).val( '' ).select2();

            //multiple-select重置
            if ( $().multipleSelect ) {
	            $form.find("select.multiple-select").filter(function( index ){
	                return idArray.indexOf( $(this).prop( 'id' ) ) == -1;
	            }).multipleSelect( "setSelects", [] );
            };
            return false;   //禁用默认的表单重置
        });
    };

    /**
     * 金额四舍五入处理
     * @param money 原有金额
     * @returns {Number}
     */
    tools.roundMoney = function(money) {
        return (Math.round(money * Math.pow(10, 4)) / Math.pow(10, 4));
    };

    /**
     * 单价四舍五入处理
     * @param price 原有单价
     * @returns {Number}
     */
    tools.roundPrice = function(price) {
        return (Math.round(price * Math.pow(10, 4)) / Math.pow(10, 4));
    };
    
    /**
     * 初始化全选功能（通过NAME定位行级checkbox）
     */
    tools.initSelectAllByName = function(selectAllId, detailCheckBoxName){
    	var selectAllCheckbox = $("#"+selectAllId);
    	//绑定事件
    	selectAllCheckbox.click(function(){
    		var detailCheckBoxs = $(":checkbox[name='"+detailCheckBoxName+"']:visible");
    		if($(this).attr("checked")){
    			detailCheckBoxs.attr("checked", true);
    		}else{
    			detailCheckBoxs.removeAttr("checked");
    		}
    		App.updateUniform(detailCheckBoxs);
    	});
    	//绑定事件
    	var detailCheckBoxs = $(":checkbox[name='"+detailCheckBoxName+"']:visible");
    	detailCheckBoxs.click(function(){
    		var detailCheckBoxs = $(":checkbox[name='"+detailCheckBoxName+"']:visible");
    		if(!$(this).attr("checked")){
    			selectAllCheckbox.removeAttr("checked");
    		}else{
    			var selectAllCheck = true;
    			detailCheckBoxs.each(function(){
    				if(!$(this).attr("checked")){
    					selectAllCheck = false;
    					return false;
    				}
    			});
    			if(selectAllCheck){
    				selectAllCheckbox.attr("checked", true);
    			}
    		}
    		App.updateUniform(selectAllCheckbox);
    	});
    };
    
    /**
     * 初始化全选功能（通过class定位行级checkbox）
     */
    tools.initSelectAllByClass = function(selectAllId, detailCheckBoxClass){
    	var selectAllCheckbox = $("#"+selectAllId);
    	//绑定事件
    	selectAllCheckbox.click(function(){
    		var detailCheckBoxs = $(":checkbox."+detailCheckBoxClass+":visible");
    		if($(this).attr("checked")){
    			detailCheckBoxs.attr("checked", true);
    		}else{
    			detailCheckBoxs.removeAttr("checked");
    		}
    		App.updateUniform(detailCheckBoxs);
    	});
    	
    	var detailCheckBoxs = $(":checkbox."+detailCheckBoxClass+":visible");
    	//绑定事件
    	detailCheckBoxs.click(function(){
    		var detailCheckBoxs = $(":checkbox."+detailCheckBoxClass+":visible");
    		if(!$(this).attr("checked")){
    			selectAllCheckbox.removeAttr("checked");
    		}else{
    			var selectAllCheck = true;
    			detailCheckBoxs.each(function(){
    				if(!$(this).attr("checked")){
    					selectAllCheck = false;
    					return false;
    				}
    			});
    			if(selectAllCheck){
    				selectAllCheckbox.attr("checked", true);
    			}
    		}
    		App.updateUniform(selectAllCheckbox);
    	});
    };
    
    tools.initSelectAllById = function(selectAllId){
    	var selectAllCheckbox = $("#"+selectAllId);
    	var vTable = selectAllCheckbox.parents("table");
    	var vThs = $("th", vTable);
    	var index = -1;
    	vThs.each(function(ind, obj){
    		if(this == selectAllCheckbox.parents("th")[0]){
    			index = ind;
    			return false;
    		}
    	});
    	//绑定事件
    	selectAllCheckbox.click(function(){
    		if($(this).attr("checked")){
    			$("tr", vTable).each(function(){
    				var itemCheckbox = $("td:eq("+index+") :checkbox:visible", this);
    				itemCheckbox.attr("checked", true);
    				App.updateUniform(itemCheckbox);
    			});
    		}else{
    			$("tr", vTable).each(function(){
    				var itemCheckbox = $("td:eq("+index+") :checkbox:visible", this);
    				itemCheckbox.removeAttr("checked");
    				App.updateUniform(itemCheckbox);
    			});
    		}
    	});
    	
    	//绑定事件
    	$("tr", vTable).each(function(){
			var itemCheckbox = $("td:eq("+index+") :checkbox:visible", this);
			itemCheckbox.click(function(){
	    		if(!$(this).attr("checked")){
	    			selectAllCheckbox.removeAttr("checked");
	    		}else{
	    			var selectAllCheck = true;
	    			$("tr", vTable).each(function(){
	    				var vItemCheckbox = $("td:eq("+index+") :checkbox:visible", this);
	    				if(vItemCheckbox.length <1){
	    					return true;
	    				}
	    				if(!vItemCheckbox.attr("checked")){
	    					selectAllCheck = false;
	    					return false;
	    				}
	    			});
	    			if(selectAllCheck){
	    				selectAllCheckbox.attr("checked", true);
	    			}
	    		}
	    		App.updateUniform(selectAllCheckbox);
			});
		});
    };
    
})( jQuery, window.tools || ( window.tools={} ) );

/*
    $.Alert('xxxxxx');
    $.Confirm('xxxx','',function(){
        console.info(2222);
    });
*/
// alert编写
jQuery.Alert = function(message, imageUrl, fn) {
    var page_content = $(document.body);// $("div[class = 'page-content']");
    var alertMessage = '确定要关闭吗？ ';
    var imageTag = '';
    var fn = ($.isFunction(fn)&&fn)?fn:$.noop;//add by lwf  是否传入回调函数 并且是否为函数形式
    if (message) {
        alertMessage = message;
    }
    if (imageUrl) {
        imageTag = "<img src='" + imageUrl + "' />";
    }
    var content = '<div id="alert_Modal" class="modal fade" aria-hidden="true" role="basic" tabindex="-1" style="display: none;z-index:100001!important;"><div class="modal-dialog modal-dialog-marTop" style="width: 300px;margin-top:180px;"><div class="modal-content"><div class="modal-header">    <button class="close" aria-hidden="true" onclick="$.Alert.destoryAlert()" type="button"></button><h4 class="modal-title" style="text-align:left;">提示</h4></div><div class="modal-body"> '
            + imageTag
            + alertMessage
            + '</div><div class="modal-footer"><button class="btn blue" type="button" onclick="$.Alert.destoryAlert()">确定</button></div></div></div></div>';
    // 添加alert弹出框
    var alert_Modal = [];
    function addAlert() {
        page_content.append(content);
        var alert_Modal_Interval = window.setInterval(function() {
            alert_Modal = $('#alert_Modal');
            if (alert_Modal.length > 0) {
                alert_Modal.modal({
                    backdrop : 'static',
                    keyboard : false
                });
                alert_Modal.on('hidden.bs.modal', function(e) {
                    alert_Modal.remove();
                    fn.call(this);
                });
                alert_Modal.modal("show");
                clearInterval(alert_Modal_Interval);
            }
        }, 50);
    }

    addAlert();
};
// 销毁alert弹出框
jQuery.Alert.destoryAlert = function() {
    $('#alert_Modal').modal('hide');
};

// confirm编写
jQuery.Confirm = function(message, imageUrl, fn) {
    var page_content = $(document.body);// $("div[class = 'page-content']");
    var alertMessage = '确定要操作吗？ ';
    var r;
    var imageTag = '';  
    var fn = ($.isFunction(fn)&&fn)?fn:$.noop;//add by wjl  是否传入回调函数 并且是否为函数形式
    if (message) {
        alertMessage = message;
    }
    if (imageUrl) {
        imageTag = "<img src='" + imageUrl + "' />";
    }
    var content = '<div id="confirm_Modal" class="modal fade" aria-hidden="true" role="basic" tabindex="-1" style="display: none;z-index:100001!important;"><div class="modal-dialog" style="width: 300px;margin-top:140px;"><div class="modal-content"><div class="modal-header">  <h4 class="modal-title" style="text-align:left;">提示</h4></div><div class="modal-body">'
            + imageTag
            + alertMessage
            + '</div><div class="modal-footer"><button class="btn blue" data-dismiss="modal" id="okDopConfirmButton" type="button">确定</button><button class="btn default" type="button" id="destoryDopConfirmButton">取消</button></div></div></div></div>';
    // 添加confirm弹出框
    var Confirm_Modal = [];
    function addConfirm() {
        page_content.append(content);
        var confirm_Modal_Interval = window.setInterval(function() {
            Confirm_Modal = $('#confirm_Modal');
            if (Confirm_Modal.length > 0) {
                Confirm_Modal.modal({
                    backdrop : 'static',
                    keyboard : false
                });
                Confirm_Modal.on('hidden.bs.modal', function(e) {
                    Confirm_Modal.remove();
                });
                Confirm_Modal.modal("show");

                $("#destoryDopConfirmButton").bind("click", function() {
                    $.Confirm.destoryConfirm();   //取消的时候不需要回调
                    //fn.call(this);                                 
                });
                $("#okDopConfirmButton").bind("click", function() {
                    fn.call(this);                                  
                });
                clearInterval(confirm_Modal_Interval);
            }
        }, 50);

    }

    addConfirm();
};

// 销毁confirm弹出框
jQuery.Confirm.destoryConfirm = function() {
    $('#confirm_Modal').modal('hide');
};

// errAlert编写
jQuery.Err = function(message, imageUrl) {
    var page_content = $(document.body);// $("div[class = 'page-content']");
    var alertMessage = '关闭 ';
    var imageTag = '';
    if (message) {
        alertMessage = message;
    }
    if (imageUrl) {
        imageTag = "<img src='" + imageUrl + "' />";
    }
    var content = '<div id="err_Modal" class="modal fade" aria-hidden="true" role="basic" tabindex="-1" style="display: none;"><div class="modal-dialog" style="width: 400px;margin-top:180px;"><div class="modal-content"><div class="modal-header">   <button class="close" aria-hidden="true" onclick="jQuery.Err.destoryAlert()" type="button"></button><h4 class="modal-title" style="text-align:left;">异常信息</h4></div><div class="modal-body"> '
            + imageTag
            + '<div  style="resize:none; border:1px solid #CCC;width:338px;margin-bottom:-20px; height:180px; overflow:auto">'
            + alertMessage
            + '</div>'
            + '</div><div class="modal-footer"><button class="btn blue" type="button" onclick="jQuery.Err.destoryAlert()">确定</button></div></div></div></div>';
    // 添加alert弹出框
    var err_Modal = [];
    function addAlert() {
        page_content.append(content);
        var alert_Modal_Interval = window.setInterval(function() {
            err_Modal = $('#err_Modal');
            if (err_Modal.length > 0) {
                err_Modal.modal({
                    backdrop : 'static',
                    keyboard : false
                });
                err_Modal.on('hidden.bs.modal', function(e) {
                    err_Modal.remove();
                });
                err_Modal.modal("show");
                clearInterval(alert_Modal_Interval);
            }
        }, 50);
    }

    addAlert();
};

// 销毁ErrAlert弹出框
jQuery.Err.destoryAlert = function() {
     $('#err_Modal').modal("hide");
};

/*
 * jquery validation 自定义校验
 */
if( $.validator ){
	//自定义验证，如果订单类型是L临采，则渠道必须是车享受家，只做为示例使用(Added by guyifeng)
	$.validator.addMethod( 'isValidChannel', function(value, element) {
	   var returnVal = true;  
       var salesOrderType = $("#salesOrderType").val(); 
       var salesOrderChannel = $("#salesOrderChannel").val();
       if(salesOrderType=="3" && salesOrderChannel!="1"){  
           returnVal = false;  
       }  
       return returnVal;  
	}, '渠道与订单类型不匹配');
	//手机号码验证
	$.validator.addMethod( 'isMobile', function(value, element) {
		var isMob=/^((\+?86)|(\(\+86\)))?(13[0123456789][0-9]{8}|15[012356789][0-9]{8}|18[012356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
		return ( value == '' || isMob.test(value) );
	}, '请输入正确的手机号码');
	
	//电话号码验证
	$.validator.addMethod( 'isPhone', function(value, element) {
		var phone = /^0\d{2,3}-?\d{7,8}$/; //电话号码格式010-12345678
		return ( value == '' || phone.test( value ) );
	}, '请输入正确的电话');
	
	//传真校验
	$.validator.addMethod( 'isFax', function(value, element) {
		var fax = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/; 
		return ( value == '' || fax.test( value ) );
	}, '请输入正确的传真号码');
	
	//特殊字符
	$.validator.addMethod( 'isSpecial', function(value, element) {
		var special = /[.~!@#$%\^\+\*&\\\/\?\|:\.{}()';="]+/;
		return !special.test( value );
	}, '不能输入特殊字符');
	
	//正整数
	$.validator.addMethod( 'isNumber', function(value, element) {
		var special =/^\+?[0-9][0-9]*$/;
		return ( value == '' || special.test( value ));
	}, '请输入正确的非负整数');
	
	//非零正整数
	$.validator.addMethod( 'isNumberNoZero', function(value, element) {
		var special =/^\+?[1-9][0-9]{0,11}$/;
		return ( value == '' || special.test( value ));
	}, '请输入位数不大于12的非零正整数');	
	
	//正小数和正数的验证
	$.validator.addMethod( 'isRational', function(value, element) {
		var rational = /^(\d{0,12}|\d{0,12}\.(\d{1,8})?)$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入有效数据');
	//输入金额验证
	$.validator.addMethod( 'isAmount', function(value, element) {
		var rational =/^-?([1-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,2})|[0]\.(\d{1,2}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的金额格式,1-12位整数,0-2位小数');
	//输入正数金额验证
	$.validator.addMethod( 'isPositiveAmount', function(value, element) {
		var rational =/^([1-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,2})|[0]\.(\d{1,2}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的大于0的金额格式,1-12位整数,0-2位小数');
	//输入金额验证包含0
	$.validator.addMethod( 'isAmountIncludeZero', function(value, element) {
		var rational =/^-?([1-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,2})|[0]\.(\d{1,2})|0)$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的金额格式,1-12位整数,0-2位小数');
	//输入数量验证
	$.validator.addMethod( 'isQty', function(value, element) {
		var rational =/^([1-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,2})|[0]\.(\d{1,2}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的数量格式,1-12位整数,0-2位小数');	
	//输入税率验证
	$.validator.addMethod( 'isTaxRate', function(value, element) {
		var rational =/^([0-9]|\d{1}\.(\d{1,2})|[0]\.(\d{1,2}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的税率格式,1位整数,0-2位小数');
	//输入折扣率验证
	$.validator.addMethod( 'isDiscountRate', function(value, element) {
		var rational =/^([0-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,2})|[0]\.(\d{1,2}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的折扣率格式,0-1,0-2位小数');
	//输入折扣率验证
	$.validator.addMethod( 'isDiscountRate2', function(value, element) {
		var rational =/^([1-9]|[1-9][0-9])$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的折扣率格式,1-99之间的整数');	
	//输入折扣率验证
	$.validator.addMethod( 'isDiscountRate3', function(value, element) {
		var rational =/^([1-9]|[1-9][0-9]|[0-9].[1-9]|[0-9].[0-9][1-9]|[1-9][0-9].[1-9]|[1-9][0-9].[0-9][1-9])$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的折扣率格式,1-99之间并且小数2位有效数字的整数');		
	///输入价格校验
	$.validator.addMethod( 'isPrice', function(value, element) {
		var rational =/^([1-9]\d{0,11}|[1-9]\d{0,11}\.(\d{1,6})|[0]\.(\d{1,6}))$/; 
		return ( value == '' || rational.test( value ) );
	}, '请输入正确的价格格式,1-12位整数,0-6位小数');
	
	//非零正小数和正数的验证
	$.validator.addMethod( 'noZero', function(value, element) {
		var rational = /^([0]*|[0]*\.{1}[0]*)$/; 
		return ( value == '' || !rational.test( value ) );
	}, '数据不能为零');	
	
	//生效时间小于生效时间
	$.validator.addMethod( 'isActiveDateLessCurrentDate', function(value, element) {
		var activeTime =$('#activeDate').val();//生效时间
		var nowTime=new Date().format("yyyy-MM-dd");//当前时间
		if(activeTime != ''  && activeTime < nowTime){
			$('#activeTime').val('');//生效时间
			return false;
		}else{
			return true;
		}
	}, "生效时间不能小于当前时间!");
	
	//生效时间小于生效时间
	$.validator.addMethod( 'isApplyDateLessCurrentDate', function(value, element) {
		var applyTime =$('#applyDate').val();//生效时间
		var nowTime=new Date().format("yyyy-MM-dd");//当前时间
		if(applyTime != ''  && applyTime < nowTime){
			$('#applyDate').val('');//生效时间
			return false;
		}else{
			return true;
		}
	}, "申请时间不能小于当前时间!");
	
	
	
	//失效时间小于当前时间
	$.validator.addMethod( 'isExpireDateLessCurrentDate', function(value, element) {
		var expireTime =$('#expireDate').val();//失效时间
		var nowTime=new Date().format("yyyy-MM-dd");//当前时间
		if(expireTime != ''  && expireTime < nowTime){
			$('#expireDate').val('');//失效时间
			return false;
		}else{
			return true;
		}
	}, "失效时间不能小于当前时间!");
	
	//失效时间小于生效时间
	$.validator.addMethod( 'isExpireDateLessActiveDate', function(value, element) {
		var activeTime =$('#activeDate').val();//生效时间
		var expireTime =$('#expireDate').val();//失效时间
		if(activeTime!='' && expireTime != '' && activeTime>expireTime){
			$('#expireTime').val('');//失效时间
			return false;
		}else{
			return true;
		}
	}, "失效时间不能小于生效时间!");
	
	//检测sql注入特殊单词过滤
	$.validator.addMethod( 'isSqlInjection', function(value, element) {
		var special = /(\sand\s)|(\sor\s)|(\slike\s)|(select\s)|(insert\s)|(delete\s)|(update\s[\s\S].*\sset)|(create\s)|(\stable)|(\sexec)|(declare)|(\struncate)|(\smaster)|(\sbackup)|(\smid)|(\scount)|(\sadd\s)|(\salter\s)|(\sdrop\s)|(\sfrom\s)|(\struncate\s)|(\sunion\s)|(\sjoin\s)|(')/;
		return !special.test( value );
	}, '不能输入特殊单词关键字');
	
}

//统一设置ajax请求提示信息
$(function(){
	$.ajaxSetup({
		beforeSend: function(){
			App.blockUI( $('body') );
		},
		complete: function(){
			App.unblockUI( $('body') );
		}
	}); 
});

//日期格式化
//对Date的扩展，将 Date 转化为指定格式的String   
//月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
//年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
//例子：   
//(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
//(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, // month
		"d+" : this.getDate(), // day
		"h+" : this.getHours(), // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
		"S" : this.getMilliseconds()
	// millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
	return format;
};

//字体串转为date对象
//例子：'2015-05-21'.stringToDate()
String.prototype.stringToDate = function(){
	return new Date(Date.parse(this.replace(/-/g, "/")));
}

//加法
Number.prototype.add = function(arg){   
    var r1,r2,m;   
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}   
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}   
    m=Math.pow(10,Math.max(r1,r2))   
    return (this.mul(m)+Number(arg).mul(m))/m   
}   

//减法   
Number.prototype.sub = function (arg){   
	var r1,r2,m;   
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}   
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}   
    m=Math.pow(10,Math.max(r1,r2))   
    return (this.mul(m)-Number(arg).mul(m))/m   
}   


//乘法   
Number.prototype.mul = function (arg)   
{   
    var m=0,s1=this.toString(),s2=arg.toString();   
    try{m+=s1.split(".")[1].length}catch(e){}   
    try{m+=s2.split(".")[1].length}catch(e){}   
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)   
}   
 
//除法   
Number.prototype.div = function (arg){   
    var t1=0,t2=0,r1,r2;   
    try{t1=this.toString().split(".")[1].length}catch(e){}   
    try{t2=arg.toString().split(".")[1].length}catch(e){}   
    with(Math){   
        r1=Number(this.toString().replace(".",""))   
        r2=Number(arg.toString().replace(".",""))   
        return (r1/r2)*pow(10,t2-t1);   
    }   
}  

function testCXP(testStr){
//	var rational = /^\d{0,8}\.{0,1}(\d{1,6})?$/; 
	var rational = /^\d{0,8}\.{0,1}(\d{1,6})?$/; 
	return ( testStr == '' || rational.test( testStr ) );
}


jQuery.AddTableOnClick = function(tableId) {
		$("#"+tableId).on("click",function(event) {
			var trObj = event.target[0] == undefined ? event.target :  event.target[0];
			var tagName = trObj.tagName;
			if(trObj.type == "checkbox"){
				return true;
			}
			var i = 1;
			do{
				trObj = $(trObj).parent()[0] == undefined ? $(trObj).parent() : $(trObj).parent()[0];
				tagName = trObj.tagName;
				i++;
			}while(i<10 && tagName != "TR")
			if(i < 10){
				$($(trObj).find("input[type^=checkbox]")[0]).trigger("click");
			}	
		})
}


jQuery.AddTableOnClickRadio = function(tableId) {
		$("#"+tableId).on("click",function(event) {
			var trObj = event.target[0] == undefined ? event.target :  event.target[0];
			var tagName = trObj.tagName;
			if(trObj.type == "radio"){
				return true;
			}
			var i = 1;
			do{
				trObj = $(trObj).parent()[0] == undefined ? $(trObj).parent() : $(trObj).parent()[0];
				tagName = trObj.tagName;
				i++;
			}while(i<10 && tagName != "TR")
			if(i < 10){
				$($(trObj).find("input[type^=radio]")[0]).trigger("click");
			}	
		})
}