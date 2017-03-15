/**
use for index js
**/

$(function() {
    //初始化
    App.init();

    /*var menuItem = $( "#sideMenu li a[target='iframepage']" ),
        $frameWrap = $( "#iframeWrap" ),
        $iframepage = $frameWrap.find( 'iframe' );
    //默认load welcome页面
    frameWrap.load( "welcome.html" );
    //点击左侧菜单Load入相应页面
    menuItem.on( "click", function(){
        var url = $.trim( $(this).prop( 'href' ) );
        //如果不是最后一级子菜单，返回
        if( $(this).next().is("ul.sub-menu") ) return;
        $iframepage.prop( 'src', url );
        return false;
    });*/
    //给当前页面菜单添加class标识
    var $sideMenu = $('#sideMenu'),
        $menuItem = $sideMenu.find('a[target="iframepage"]'),
        $mainFrame = $('#iframepage');
    $menuItem.on('click', function(){
        $mainFrame.attr( 'src', $(this).attr('href') );
        $menuItem.parent("li").removeClass('active');
        $(this).parent("li").addClass('active');
        $sideMenu.children('li').removeClass('active');
        $sideMenu.children('li').find('span.selected').remove();
        $sideMenu.children('li.open').addClass('active');
        $sideMenu.children('li.open').children('a').append('<span class="selected"></span>');
        //return false;
    });
    //监听窗口变化，重置左侧菜单滚动高度
    $(window).resize(function(){
        $('.slimScrollDiv, .scroller').height( $('.page-sidebar').height() );
    });
});