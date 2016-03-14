var socket = io();

$('#search').keyup(function() {
  var searchString = $('#search').val()
  socket.emit('weatherSearch', searchString)
  return false;
})

socket.on('weatherSearch', function(searchString) {
  console.log(searchString)
$('.search-results').html(searchString);
})

$('.search-results').on('click', '.search__result', function(e) {
  e.preventDefault();
  var city = $(this).data('attr')
  socket.emit('weatherClick', city)
  return false
})

socket.on('weatherClick', function(arr) {
    console.log(arr)
    $('.day-container').html('');
    for (var i = 0; i < arr.length; i++) {
	    let max = arr[i][0]
	    let min = arr[i][1]
	    console.log(max + ' ' + min);
	    $('.day-container').append('<div class="day" style="height: ' + (max*2) + 'px"><div class="max" style="height:' + (max*3) + 'px;"><span class="degree">' + max + '</span></div><div class="min" style="height:' + (min*3) + 'px;" ><span class="degree">' + min + '</div></div>')
    }
})
