class AdelieCart {
    constructor({marginTop='100px', color='#ce2d30', secretKey="a"}) {
        this.marginTop = marginTop;
        this.color = color;
        this.secretKey = secretKey
    }

    init(){
        $('#adelie').html('Class is wokring fine!!!')
        console.log(this.marginTop, this.color, this.secretKey)
    }
    update () {
        if (this.secretKey) {
            this.init()
        }else{
            console.log("Please provide the secretKey")
        }
    }
}

new AdelieCart({})