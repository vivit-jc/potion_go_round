var material_name = ['mushroom','lizard','herbs','earthworm']
var order = ["red","green","purple"]
var price = [100,150,200]
var gamemode_str = ["easy", "normal", "hard", "endless hasty", "endless 0miss"]

var potions = []
var witch_pos = [24,88,152,216,280,344]
var witches = [null,null,null,null,null,null]
var potion_total = 0
var score = 0
var hyouban = 20
var stock = [10,10,10,10]
var combo = 0
var max_combo = 0
var time = 20
var gamemode = ""

$(function(){
  initialize_element()
  initialize_data()
})

function initialize_data(){
  potions = []
  witches = [null,null,null,null,null,null]
  potion_total = 0
  score = 0
  hyouban = 20
  stock = [10,10,10,10]
  combo = 0
  max_combo = 0
  time = 20
  gamemode = ""
}

function initialize_element(){
  for(i=0;i<=4;i++) show_stock(i)

  $(".stagename").hover(function(){
    $(this).css("background-color","black")
    $(this).css("color","white")
  },function(){
    $(this).css("background-color","white")
    $(this).css("color","black")
  })

  $(".stagename").each(function(i,e){
    var score = localStorage.getItem("sushipotion"+gamemode_str[i])
    if(score == null) score = 0
    $(this).text(gamemode_str[i]+" "+score)
  })

  $(".stagename").click(function(){
    $("#title").toggle()
    $("#game").toggle()
    gamemode = $(this).attr("id")
    start_game()
  })

  $("td").click(function(){
    var material = $(this).attr("id")
    var no = get_material_no(material)
    if(stock[no] == 0) return false
    $("#cauldron").append("<img class=\""+material+"\" src=\"img/"+material+".png\">")
    stock[no] -= 1
    show_stock(no)
  })

  $("#book").click(function(){
    toggle_recipe()
  })

  $(".witch").click(function(){
    var id = parseInt($(this).attr("id"),10)
    if(witches[id] == "taken") {
      witches[id] = null
      $("#w"+id).attr("src","img/white.png")
    }
  })

  $("#cauldron").click(function(){
    var materials = jQuery.map($(this).children(),function(material,i){
      return $(material).attr("class")
    })
    var materialbox = [0,0,0,0]
    var material_size = materials.length
    jQuery.each(materials,function(i,mname){
      switch(mname){
        case 'mushroom'  : materialbox[0]+=1; break;
        case 'lizard'    : materialbox[1]+=1; break;
        case 'herbs'     : materialbox[2]+=1; break;
        case 'earthworm' : materialbox[3]+=1; break;
      }
    })
    if([1,1,0,0].toString() == materialbox.toString()){
      go_round_potion('red')
    } else if([1,1,1,0].toString() == materialbox.toString()){
      go_round_potion('green')
    } else if([1,1,1,1].toString() == materialbox.toString()){
      go_round_potion('purple')
    } else if(material_size > 0) {
      go_round_potion('')
    }
    $("#cauldron").children().remove()
  })
}

function start_game(){
  // ポーションの定期処理
  show_data()

  var repeat_potion = setInterval(function(){
    jQuery.each(potions,function(i){
      move_potion(i)
      check_order(i)
    })
    potions = potions.filter(function(e){return e != null})
  },150)

  // 客の定期処理
  var repeat_witch = setInterval(function(){
    set_order()
    jQuery.each(witches, function(i,witch){
      if(witch != null) waiting_witch(i)
    })
    time -= 1
    if(time == 0){
      clearInterval(repeat_potion)
      clearInterval(repeat_witch)
      finish_game()
    }
  },1000)
}

function finish_game(){
  $("#cauldron").children().remove()
  $("#phone").hide()
  $("#book").hide()
  $("td").off()
  $("div").off()
  $("#cauldron").append("<p id=\"finish_score\"></p>")
  $("#cauldron").append("<p id=\"max_combo\"></p>")
  $("#cauldron").append("<p id=\"return_title\">return title</p>")
  $("#max_combo").text("max combo "+max_combo)
  $("#finish_score").text("score "+score)
  $("#return_title").hover(function(){
    $(this).css("background-color","black")
    $(this).css("color","white")
  },function(){
    $(this).css("background-color","white")
    $(this).css("color","black")
  })

  if(score > localStorage.getItem("sushipotion"+gamemode)){
    localStorage.setItem("sushipotion"+gamemode, score)
  }

  $("#return_title").click(function(){
    $("#game").toggle()
    $("#title").toggle()
    $("#cauldron").children().remove()
    $(".gamevalues").text("")
    initialize_data()
    initialize_element()
  })
  $("#belt").children().remove()
  for(var i=0;i<6;i++) remove_witch(i)
}

function set_order(){
  if(dice() >= 3) return false
  if(witches.indexOf(null)<0) return false
  var potion = order[Math.floor(Math.random()*order.length)]
  while(true){
    var no = dice()
    if(!witches[no]){
      witches[no] = [potion,60]
      add_witch(no)
      break
    }
  }
}

function waiting_witch(no){
  if(witches[no] == "taken") return true
  witch = witches[no]
  witch[1] -= 1
  if(witch[1] == 0){
    remove_witch(no,false)
    witches[no] = null
    if(hyouban > 0) hyouban -= 3
    combo = 0
    show_data()
  }
}

function remove_witch(no, bag){
  if(bag) $("#w"+no).attr("src","img/bag.png")
  else $("#w"+no).attr("src","img/white.png")
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
  $("img#p"+potions[potion_no][2]).offset({left: left})
}

function check_order(potion_no){
  var potion = potions[potion_no]
  var color = potion[0]
  jQuery.each(witch_pos, function(i,pos){
    if(witches[i] == null || potion[1] != pos) return true
    if(color == witches[i][0]){
      remove_witch(i,true)
      $("#p"+potion[2]).remove()
      potions[potion_no] = null
      witches[i] = "taken"
      score += price[order.indexOf(color)]
      if(hyouban < 20) hyouban += 1
      combo += 1
      score += combo * 2
      if(combo > max_combo) max_combo = combo
      show_data()
    }
  })
}

function go_round_potion(color){
  $("#belt").append("<img class=\"potion\" id=\"p"+potion_total+"\" src=\"img/"+color+"potion.png\">")
  $("img#p"+potion_total).offset({left: 8});
  potions.push([color, 8, potion_total])
  potion_total += 1
}

function show_data(){
  var str = ""
  for(var i=0;i<hyouban;i++) str += "|"
  if(str == "") str = "|"
  $("#hyouban").text(str)
  $("#score").text("score: "+score)
  if(combo > 2) $("#combo").text(combo+"combo!")
}

function toggle_recipe(){
  $("#recipe").toggle()
}

function show_stock(material_no){
  $("#"+material_name[material_no]+"_s").text(stock[material_no])
}

function get_material_no(material){
  return material_name.indexOf(material)
}

function dice(){
  return Math.floor(Math.random()*6)
}