var material_name = ['mushroom','lizard','herbs','earthworm']
var order = ["red","green","purple","blue"]
var price = [100,160,200,120]
var gamemode_str = ["easy", "normal", "hard", "endless hasty", "endless 0miss"]

var potions = []
var witch_pos = [24,88,152,216,280,344]
var witches = [null,null,null,null,null,null]
var potion_total = 0
var score = 0
var stock = [10,10,10,10]
var combo = 0
var max_combo = 0
var gamemode = ""
var recipe_page = 0
var default_stamina = 5
var stamina = default_stamina
var stamina_charge = 0
var delivering = false
var default_reputation = 20
var reputation = default_reputation
var default_gametime = 300*4 // *4は客の定期処理が250msに1度行われていることによる
var gametime = default_gametime
var witch_waittime = 80*4

$(function(){
  initialize_element()
  initialize_data()
})

function initialize_data(){
  potions = []
  witches = [null,null,null,null,null,null]
  potion_total = 0
  score = 0
  stock = [10,10,10,10]
  combo = 0
  max_combo = 0
  reputation = default_reputation
  gametime = default_gametime
  gamemode = ""
  recipe_page = 0
  stamina = default_stamina
  stamina_charge = 0
  deivering = false
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

  $("td.material").click(function(){
    var material = $(this).attr("id")
    var no = get_material_no(material)
    if(stock[no] == 0) return false
    $("#cauldron").append("<img class=\""+material+"\" src=\"img/"+material+".png\">")
    stock[no] -= 1
    show_stock(no)
  })

// レシピブック
  $("#book").click(function(){
    $("#owl_select").hide()
    toggle_recipe()
    return false
  })

  $(".recipe_page").click(function(){
    return false
  })

  $(".arrow").click(function(){
    if(recipe_page == 1) {
      recipe_page = 2
      $("#recipe_1").hide()
      $("#recipe_2").show()
    } else if(recipe_page == 2) {
      recipe_page = 1
      $("#recipe_2").hide()
      $("#recipe_1").show()
    }
    return false
  })

// フクロウ
  $("#owl").click(function(){
    $(".recipe_page").hide()
    if(stamina <= 0 || delivering) return true
    $("#owl_select").toggle()
    return false
  })

  $(".owl_order").click(function(){
    owl_delivery($(this).attr("id"))
  })

  $(document).click(function(){
    $(".subwindow").hide()
  })

// 魔女（金貨袋）
  $(".witch").click(function(){
    var id = parseInt($(this).attr("id"),10)
    if(witches[id] == "taken") {
      witches[id] = null
      $("#w"+id).attr("src","img/white_h.png")
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
    } else if([0,1,1,0].toString() == materialbox.toString()){
      go_round_potion('blue')
    } else if([0,0,2,0].toString() == materialbox.toString()){
      go_round_potion('orange')
    } else if([0,2,0,1].toString() == materialbox.toString()){
      go_round_potion('sky')
    } else if([3,0,0,0].toString() == materialbox.toString()){
      go_round_potion('pink')
    } else if([1,0,1,2].toString() == materialbox.toString()){
      go_round_potion('gray')
    } else if(material_size > 0) {
      go_round_potion('')
    }
    $("#cauldron").children().remove()
  })

}

function start_game(){

  show_data()

  // ポーションの定期処理
  var repeat_potion = setInterval(function(){
    jQuery.each(potions,function(i){
      move_potion(i)
      check_order(i)
    })
    reject_null_potion()
  },100)

  // 客の定期処理
  var repeat_witch = setInterval(function(){
    if(gametime%2 == 0 && dice() >= 4) set_order()
    jQuery.each(witches, function(i, witch){
      if(witch != null) waiting_witch(i)
    })
    gametime -= 1
    show_timer()
    if(gametime == 0 || reputation <= 0){
      clearInterval(repeat_potion)
      clearInterval(repeat_witch)
      finish_game()
    }
  }, 250)

  // フクロウのスタミナ
  var rest_owl = setInterval(function(){
    if(delivering) return false
    if(stamina == -1 && stamina_charge == 40) up_stamina()
    else if(stamina == 0 && stamina_charge == 32) up_stamina()
    else if(stamina <= 4 && stamina_charge == 20) up_stamina()
    else if(stamina <= 4) stamina_charge += 1
  }, 250)
}

function finish_game(){
  $("#cauldron").children().remove()
  $(".subwindow").hide()
  $("#combo").text("")
  $("td").off()
  $("div").off()
  $("#cauldron").append("<p class=\"bold\">game over</p>")
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
  witches = [null, null, null, null, null, null]
  setTimeout(function(){
    for(var i=0;i<6;i++) remove_witch(i, false)
  }, 500)
}

function set_order(){
  if(witches.indexOf(null)<0) return false
  var potion = order[Math.floor(Math.random()*order.length)]
  while(true){
    var no = dice()
    if(!witches[no]){
      witches[no] = [potion, witch_waittime]
      add_witch(no)
      break
    }
  }
}

function waiting_witch(no){
  if(witches[no] == "taken") return true
  var witch = witches[no]
  var waittime = witch[1]
  witch[1] -= 1
  if(waittime <= 30*4 && waittime > 10*4 && waittime%4 == 0){
    $("#w"+no).attr("src","img/witch_1.png")
    setTimeout(function(){
      $("#w"+no).attr("src","img/witch_0.png")
    }, 400)
  }
  if(waittime <= 10*4 && waittime%2 == 0){
    $("#w"+no).attr("src","img/witch_2.png")
    setTimeout(function(){
      $("#w"+no).attr("src","img/witch_0.png")
    }, 200)
  }
  if(waittime == 0){
    remove_witch(no, false)
    witches[no] = null
    if(reputation > 0) reputation -= 3
    combo = 0
    show_data()
  }
}

function remove_witch(no, bag){
  if(bag) $("#w"+no).attr("src","img/bag.png")
  else $("#w"+no).attr("src","img/white_h.png")
  $("#b"+no).attr("src","img/white.png")
  $("#o"+no).remove()
}

function add_witch(no){
  $("#w"+no).attr("src","img/witch_0.png")
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
      if(reputation < 20) reputation += 1
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

  if(color == ""){
    $("img#p"+potion_total).click(function(){
      $(this).remove()
      potions[potion_total] = null
      reject_null_potion()
    })
  }
  potion_total += 1
}

function owl_delivery(id){
  var acttype = id.split("_")[1]
  var material = get_material_no(id.split("_")[0])
  var n_material = [6,4,4,3]
  var q_material = [5,3,3,2]
  var n_time = [7,8,8,10]
  var q_time = [2,2,2,3]
  var delitime = 0
  var num = 0
  if(acttype == "q") {
    stamina -= 2
    delitime = q_time[material]
    num = q_material[material]
  } else {
    stamina -= 1
    delitime = n_time[material]
    num = n_material[material]
  }
  show_owl()
  $("#owlimg").attr("src", "img/white.png")
  delivering = true
  $("#owl_select").hide()
  setTimeout(function(){
    stock[material] += num
    $("#owlimg").attr("src", "img/owl.png")
    delivering = false
    show_stock(material)
  }, delitime*1000)

}

function show_data(){
  var str = ""
  for(var i=0;i<reputation;i++) str += "|"
  if(str == "") str = ""
  $("#hyouban").text("reputation "+str)

  $("#score").text("score: "+score)
  if(combo > 2) $("#combo").text(combo+"combo!")
  else $("#combo").text("")
}

function toggle_recipe(){
  if(recipe_page <= 1) {
    $("#recipe_1").toggle()
    recipe_page = 1 - recipe_page
  } else if(recipe_page == 2) {
    $("#recipe_2").toggle()
    recipe_page = 0
  }
}

function up_stamina(){
  stamina += 1
  stamina_charge = 0
  show_owl()
}

function show_owl(){
  var str = ""
  for(var i=0;i<stamina;i++) str += "♥"
  $("#stamina").text(str)
}

function show_timer(){
  var str = ""
  for(var i=0;i<40;i++){
    if((default_gametime-gametime)>(default_gametime/40)*i) str += "*"
    else str += "_"
  }
  $("#timer").text(str)
}

function show_stock(material_no){
  $("#"+material_name[material_no]+"_s").text(stock[material_no])
}

function get_material_no(material){
  return material_name.indexOf(material)
}

function reject_null_potion(){
  potions = potions.filter(function(e){return e != null})
}

function dice(){
  return Math.floor(Math.random()*6)
}