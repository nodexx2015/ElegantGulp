$(function(){
    $('#menu').on('click', function(){
        $(this).toggleClass('active');
    });
    $("#down").on("click", function () {
        $("html, body").animate({
            scrollTop: $('#contact').offset().top
        }, 'slow');
    });
})