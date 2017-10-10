(function () {

	var apply_list = '{{each list as his}}'+
		'<li data-apply-id="{{his.id}}">'+
		'<ul class="shop-attr-lst group">'+
		'<li>店铺名:<a href="javascript:;">{{his.shop_name}}</a></li>'+
		'<li onclick="liclick();">账户余额：{{his.shop_balance}}元</li>'+
		'</ul>'+
		'</li>'+
		'{{/each}}';

	var data = {
		list:[
			{"id":1,"shop_name":"123","shop_balance":5000},
			{"id":2,"shop_name":"12344","shop_balance":500}
		]
	}
	var render = template.compile(apply_list);
	var html = render(data);
	$("#header11").html("").html(html);

})()