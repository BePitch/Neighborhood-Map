$(document).ready(function() {
    $('#counter').data('count', 0);
    $('#update').click(function(){
        $('#counter').html(function(){
            var $this = $(this),
                count = $this.data('count') + 1;
    
            $this.data('count', count);
            return count;
        });
    });
    
    });