var potions = []

$(function(){

  $("td").click(function(){
    material = $(this).attr("id")
    $("#cauldron").append("<img class=\""+material+"\" src=\"img/"+material+".png\">")
  })

  $("#cauldron").click(function(){
    materials = jQuery.map($(this).children(),function(material,i){
      return $(material).attr("class")
    })
    material_size = materials.length
    materialbox = [0,0,0,0]
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
    })
  },150)

})

function remove_witch(no){
  $("#w"+no).attr("src","img/white.png")
  $("#b"+no).attr("src","img/white.png")
}

function add_witch(no){
  $("#w"+no).attr("src","img/witch.png")
  $("#b"+no).attr("src","img/bubble.png")
}

function move_potion(no){
  left = potions[no][1] + 2
  if(left >= 360){left = 8}
  potions[no][1] = left
  $("img#p"+no).offset({left: left});
}

function go_round_potion(color){
  no = potions.length
  $("#belt").append("<img class=\"potion\" id=\"p"+no+"\" src=\"img/"+color+"potion.png\">")
  $("img#p"+no).offset({left: 8});
  potions.push([color, 8])
}

function dice(){
  return Math.floor(Math.random()*6)
}