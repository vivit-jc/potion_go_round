var potions = []
var witch_pos = [24,88,152,216,280,344]
var witches = [null,null,null,null,null,null]

$(function(){

  for(var i=0;i<=5;i++){remove_witch(i)}

  $("td").click(function(){
    var material = $(this).attr("id")
    $("#cauldron").append("<img class=\""+material+"\" src=\"img/"+material+".png\">")
  })

  $("#cauldron").click(function(){
    var materials = jQuery.map($(this).children(),function(material,i){
      return $(material).attr("class")
    })
    var material_size = materials.length
    var materialbox = [0,0,0,0]
    jQuery.each(materials,function(i,mname){
      switch(mname){
        case 'mushroom'  : materialbox[0]+=1; break;
        case 'lizard'    : materialbox[1]+=1; break;
        case 'herbs'     : materialbox[2]+=1; break;
        case 'earthworm' : materialbox[3]+=1; break;
      }
    })
    if(material_size == 2 && materialbox[0] == 1 && materialbox[1] == 1){
      go_round_potion('red')
    } else if(material_size == 3 && materialbox[0] == 1 && materialbox[1] == 1 && materialbox[2] == 1){
      go_round_potion('green')
    } else if(material_size > 0) {
      go_round_potion('')
    }
    $("#cauldron").children().remove();
  })

  setInterval(function(){
    jQuery.each(potions,function(i){
      move_potion(i)
      check_order(i)
      // メモ eachの途中なので、この中でpotionsに変更を加えてはいけない
    })
  },150)
  setInterval(function(){
    if(dice() == 0){
      set_order()
    }
  },1000)

})

function set_order(){
  var order = ["red","green","purple"]
  order = order[Math.floor(Math.random()*3)]
  if(witches.indexOf(null)<0){return false}
  while(true){
    var no = dice()
    if(!witches[no]){
      witches[no] = [order,100]
      add_witch(no)
      break
    }
  }
}

function remove_witch(no){
  $("#w"+no).attr("src","img/white.png")
  $("#b"+no).attr("src","img/white.png")
  $("#o"+no).remove()
}

function add_witch(no){
  $("#w"+no).attr("src","img/witch.png")
  $("#b"+no).attr("src","img/bubble.png")
  $("#bubbles").append("<img class=\"potion\" src=\"img/"+witches[no][0]+"potion.png\" id=\"o"+no+"\">")
  $("img#o"+no).offset({left: witch_pos[no],top: 14})
}

function move_potion(potion_no){
  var left = potions[potion_no][1] + 2
  if(left >= 360) left = 8
  potions[potion_no][1] = left
  $("img#p"+potion_no).offset({left: left})
}

function check_order(potion_no){
  var potion = potions[potion_no]
  var color = potion[0]
  jQuery.each(witch_pos, function(i,pos){
    if(witches[i] == null || potion[1] != pos) return true
    if(color == witches[i][0]){
      remove_witch(i)
      $("#p"+potion_no).remove()
      potions = potions.filter(function(e){return e != potion})
    }
  })
}

function go_round_potion(color){
  var no = potions.length
  $("#belt").append("<img class=\"potion\" id=\"p"+no+"\" src=\"img/"+color+"potion.png\">")
  $("img#p"+no).offset({left: 8});
  potions.push([color, 8])
}

function dice(){
  return Math.floor(Math.random()*6)
}