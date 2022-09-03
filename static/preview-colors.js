function changeBackgroundColor(){
    let colorpicker = document.getElementById('background-colorpicker');
    setInterval(()=>{
        let color = colorpicker.value;
        console.log(color)
        document.getElementById('image-template').querySelector('p').style.backgroundColor = color;
    }, 200)  
  }

  function changeTextColor(){
    let colorpicker = document.getElementById('text-colorpicker');
    setInterval(()=>{
        let color = colorpicker.value;
        document.getElementById('image-template').querySelector('p').style.color = color;
    }, 200)  
  }