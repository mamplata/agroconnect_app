$(document).ready(function() {

    $('head').prepend(`
        <link rel="icon" href="../img/logo.png" type="image/png">   
    `);
    
    // Prepend header structure with navigation links to the body
    $('.header-container').prepend(`
        <div class="container-fluid p-0">
            <header class="header d-flex justify-content-between align-items-center" style="background-color: #008000;">           
                   <div class="header d-flex align-items-center">
                        <img src="img/logo.png" alt="Logo" class="header-logo">
                        <h3 id="appName" class="pl-3">AgroConnect Cabuyao</h3>
                   </div>
                    <nav class="nav">
                        <a class="nav-link text-white" href="/">Home</a>
                        <a class="nav-link text-white" href="/seasonal-trends">Seasonal Trends</a>
                        <a class="nav-link text-white" href="/top-crops">Top Crops</a>
                        <a class="nav-link text-white" href="/map-trends">Map Trends</a>
                        <a class="nav-link text-white" href="/weather-forecast">Weather Forecast</a>
                        <a class="nav-link text-white" href="/soil-health">Soil Health</a>
                        <a class="nav-link text-white" href="/contact-us">Contact Us</a>
                    </nav>      
            </header>
        </div>
        <script>
            $(document).ready(function() {
                var path = window.location.pathname;
                $('.nav a').each(function() {
                    if (this.pathname === path) {
                    $(this).addClass('active');
                    $(this).attr('aria-current', 'page');
                    }
                });
            });
        </script>
    `);
});