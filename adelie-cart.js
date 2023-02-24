import algoliasearch from 'https://cdn.jsdelivr.net/npm/algoliasearch@4.14.2/dist/algoliasearch-lite.esm.browser.js';

{"https://raz.rentals/rental-shop/"}

export default class AdelieCart {
    constructor({ marginTop = 100, marginBottom = 20,  color = '#000', secretKey = "", appId = "", sticky=false }) {
        function margin(params) {
            if (typeof params !== 'string') {
                params = JSON.stringify(params)
            }
            if (!params.includes('px') && !params.includes('rem')) {
                params = params + 'px'
            }
            return params;
        }
        marginTop = margin(marginTop)
        marginBottom = margin(marginBottom)
        $('head').append(`
            <style>
                :root {
                    --adelie-main-color: ${color}
                }
            </style>
        `)
        this.marginTop = marginTop;
        this.marginBottom = marginBottom
        this.color = color;
        this.secretKey = secretKey;
        this.appId = appId
        this.sticky = sticky
        this.pickupDateTime = localStorage.getItem('pickupDateTime')
        this.returnDateTime = localStorage.getItem('returnDateTime')
        this.categories = []
        this.totalCategoryCount = 0
        this.allProducts = []
        this.products = []
        this.productDetailModel = false
        this.productDetail = {}
        this.cart = {}
    }
    async listDateTime() {
        await $('#adelie #adelie_left #adelieDateTime').html(`
            <div class="adelie_left_body">
                <p class='left_p_top adelie-bold adelie-border adelie-padding adelie-border-radius'>Pickup (2pm or later is no charge)</p>
                <input type="datetime-local" value="${this.pickupDateTime}" class="datetime" id="top_datetime" />

                <p class='left_p_bottom adelie-bold adelie-border adelie-padding adelie-border-radius'>Return (10am or earlier is no charge)</p>
                <input type="datetime-local" value="${this.returnDateTime}" class="datetime" id="bottom_datetime" />
            </div>
        `)
    }
    async listingCategories() {
        var data = `<div class='categoryChildren categoryHandler active' data-id="v-all"><span>All</span> <span>${this.totalCategoryCount > 0 ? this.totalCategoryCount : this.products.length}</span></div>`
        this?.categories?.map((v, i) => {
            data += `
                <div class='categoryChildren categoryHandler' data-id="${v.id}-${v.name}"><span>${v.name}</span><span>${v.count}</span></div>
            `
        })
        await $('#adelie #adelie_left #adelieCategories').html(data)
    }
    async listingSearch() {
        await $('#adelie #adelie_right #adelieSearch').html(`
            <div style="background-color: ${this.color}">
                <img src="./search.png" height="30" width="30" />
            </div>
            <input id="SearchHandler" type='text' name='search' placeholder='Search Product' />
        `)
        this.listingFunctions()
    }
    daysDifference(date) {
        var date1 = new Date()
        var date2 = new Date(date * 1000)
        var total_seconds = Math.abs(date2 - date1) / 1000000000;  
        var days_difference = Math.floor(total_seconds / (60 * 60 * 24));
        return days_difference
    }
    getRate(val){
        const date = new Date(this.returnDateTime).getDate() - new Date(this.pickupDateTime).getDate()
        let rateRange = ''
        if (date >= 1) { rateRange = 'day' } else if (date <= 7) { rateRange = 'week' }else{ rateRange = 'month' }

        return val?.rates.find(a => a.rateRange == rateRange) ? (val?.rates.find(a => a.rateRange == rateRange)?.rate / 100) * date : val?.rates[0] ? (val?.rates[0].rate / 100) * date : 0
    }
    async listingProducts() {
        var data = ``
        this?.products?.map((val, ind) => {
            var days_difference = this.daysDifference(val?.createdOn?._seconds ? val?.createdOn?._seconds : val?.createdOn)
            
            data += `
                <div class="adelie_card adelie-col productDetailHandler" data-id="${val?.id}">
                    <img src="${val?.image?.downloadURL}" />
                    <div class="adelie_card_body">
                        <h5 class="adelie_cart">
                            <span>${val?.name}</span>
                            <div>
                                <span class="adelie_cart_button">
                                    <img width='25' height="25" src="./shopping-cart.png" />
                                </span>
                            </div>
                        </h5>
                        <small>${days_difference} ${days_difference > 1 ? 'days' : 'day'} AUD ${this.getRate(val)}</small>
                    </div>
                </div>
            `
        })
        await $('#adelie #adelie_right #adelieProducts').html(data)
        this.listingFunctions()
    }
    async listingProductModel() {
        if (this.productDetailModel) {
            var days_difference = this.daysDifference(this.productDetail?.createdOn?._seconds)
            $('.adelie_model_main').removeClass('adelie_model_none')
            $('.adelie_model_main').html(`
                <div class='adelie_model'>
                    <div class="adelie_model_body">
                        <div id="adelie_model_close">
                            <img src="./close.png" height="15px" width="15px" />
                        </div>
                        <div class="adelie_model_img">
                            <span>
                                <img src="${this.productDetail?.image?.downloadURL}" />
                            </span>
                        </div>
                        <div class="adelie_model_body_details">
                            <h2><span>${this.productDetail.name}</span> <span class="adelie_model_days">${days_difference} ${days_difference > 1 ? 'days' : 'day'}</span></h2>
                            <div class="adelie_model_cart">
                                <input value='1' id="stock-${this.productDetail?.id}" type='number' ${this.productDetail?.stock < 1 && 'disabled' } min='1' max='${this.productDetail?.stock}' />
                                <button class="adelie_add_to_cart" ${this.productDetail?.stock < 1 && 'disabled' } data-id="${this.productDetail?.id}">Add to booking</button>
                                <p class="adelie_heling_text">
                                    ${this.productDetail?.stock} available stock
                                </p>
                            </div>
                            <h4>${this.productDetail.name} for Hire</h4>
                            <p>${this.productDetail.description}</p>
                        </div>
                    </div>
                </div>
            `)
            $('body').addClass('noScroll')
            
        }else{
            $('.adelie_model_main').addClass('adelie_model_none')
            $('body').removeClass('noScroll')
        }
    }
    getCartProducts () {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')): this.cart
    }
    async listingFloatingCartIcon() {
        $('#adelie_floating_cart_icon_main').html(`
            <div class="adelie_floating_cart_icon">
                <div class="adelie_floating_cart_icon_show">
                    <img width='35' height="35" src="./shopping-cart.png" />
                </div>
                <div class="adelie_floating_cart_icon_hide">
                    <span class='adelie_floating_cart_date'>${new Date(this.pickupDateTime).toLocaleDateString()}</span>
                    <span class='adelie_floating_cart_time'>${new Date(this.pickupDateTime).toLocaleTimeString()}</span>
                    -
                    <span class='adelie_floating_cart_date'>${new Date(this.returnDateTime).toLocaleDateString()}</span>
                    <span class='adelie_floating_cart_time'>${new Date(this.returnDateTime).toLocaleTimeString()}</span>
                    <hr />
                    <span class="adelie_floating_cart_items">
                        <span>Items</span>
                        <span>${Object.values(this.getCartProducts()).length}</span>
                    </span>
                </div>
            </div>
        `)
    }
    returnCartProducts() {
        let data = ''
        this.products?.filter(v => Object.keys(this.getCartProducts()).includes(v.id)).map((v, i) => {
                const qty = this.getCartProducts()[v.id]
                data += `<div class="adelie_floating_cart_body_product">
                    <div class="adelie_floating_cart_body_product_main">
                        <div data-id="${v?.id}" class="adelie_floating_cart_body_product_close">
                            <img src="./close.png" height="10px" width="10px" />
                        </div>
                        <div class="adelie_floating_cart_body_product_body">
                            <div class="adelie_floating_cart_body_product_image">
                                <img src="${v?.image?.downloadURL}" />
                            </div>
                            <div class="adelie_floating_cart_body_product_name">
                                <h6>${v?.name}</h6>
                                <div class="adelie_floating_cart_body_product_quantity">
                                    <img src="./minus.png" data-id="${v?.id}" class="adelie_floating_cart_minus" />
                                    <span>${qty}</span>
                                    <img src="./plus (1).png" data-id="${v?.id}" class="adelie_floating_cart_plus" />
                                </div>
                            </div>
                        </div>
                        <span style="text-align: right; width: 100%; display: inline-block;">AUD ${this.getRate(v) * qty}</span>
                    </div>
                </div>`
        })
        return data
    }
    async listingFloatingCart() {
        
        $('#adelie_floating_cart_main').html(`
            <div class="adelie_floating_cart">
                <div id="adelie_floating_cart_close">
                    <img src="./close_white.png" height="10px" width="10px" />
                </div>
                <div class="adelie_floating_cart_header">
                    <h6>MY ORDERS</h6>
                    <div class="adelie_floating_cart_dates">
                        <span>${new Date(this.pickupDateTime).toLocaleDateString()}</span>,
                        <span>${new Date(this.pickupDateTime).toLocaleTimeString()}</span>
                        <img src="./next.png" height="15px" width="15px" />
                        <span>${new Date(this.returnDateTime).toLocaleDateString()}</span>,
                        <span>${new Date(this.returnDateTime).toLocaleTimeString()}</span>
                    </div>
                </div>
                <div class="adelie_floating_cart_body">
                    ${this.returnCartProducts()}
                </div>
                <div class="adelie_floating_cart_footer">
                    ${Object.values(this.getCartProducts()).length === 0 
                        ? '<button disabled>REQUEST BOOKING</button>'
                        : '<a href="?booking=true">REQUEST BOOKING</a>'
                    }
                    
                    
                </div>
            </div>
        `)
    }
    async ListBookingProducts() {
        const subTotal = this.products.filter(v => Object.keys(this.getCartProducts()).includes(v.id)).map(v => {
            return this.getRate(v) * this.getCartProducts()[v.id]
        }).reduce((a, b) => {return a+b})
        const gst = 600
        await $('#adelieBookingProducts').html(this.returnCartProducts())
        await $("#adelieBookingCalculations").html(`
            <div class="adelie_booking_calculation_main">
                <hr />
                <div>
                    <b>Subtotal</b>
                    <b>AUD ${subTotal}</b>
                </div>
                <hr />
                <div>
                    <span>GST</span>
                    <span>AUD ${gst}</span>
                </div>
                <div>
                    <b>Total</b>
                    <b>AUD ${subTotal + gst}</b>
                </div>
                <a href="?booking=false">Edit booking or edit items</a>
            </div>
        `)
    }
    async ListBookingDetails(nameErr=false, emailErr=false, phoneErr=false, name='', email='', phone='', job='', note='') {
        $('.adelie_booking_right').html(`
            <h2 class="adelie_booking_personal_details">Personal Details</h2>
            <div class='adelie_booking_detail'>
                <h6>Name <span>*</span></h6>
                <input class="adelie_booking_input ${nameErr && 'error'}" value="${name}" type='text' name='name' />
            </div>
            <div class='adelie_booking_detail'>
                <h6>Email <span>*</span></h6>
                <input class="adelie_booking_input ${emailErr && 'error'}" value="${email}" type='email' name='email' />
            </div>
            <div class='adelie_booking_detail'>
                <h6>Phone <span>*</span></h6>
                <input class="adelie_booking_input ${phoneErr && 'error'}" value="${phone}" type='number' name='phone' />
            </div>
            <div class='adelie_booking_detail'>
                <h6>Job Name</h6>
                <input class="adelie_booking_input" value="${job}" type='text' name='job' />
            </div>
            <div class='adelie_booking_detail'>
                <h6>Special Notes</h6>
                <input class="adelie_booking_input" value="${note}" type='text' name='note' />
            </div>
            <input type="button" id="adelie_request_booking_button" value="Request Booking">
        `)
    }
    async listing() {
        $('#adelie').css({ 'margin-top': this.marginTop, 'margin-bottom': this.marginBottom })
        const index = `
                        <div class="adelie_model_main adelie_model_none"></div>
                        <div id="adelie_left" class='adelie-border adelie-border-radius ${this.sticky && 'adelieLeftSticky'}'>
                            <div id="adelieDateTime"></div>
                            <div id="adelieCategories"></div>
                        </div>
                        <div id="adelie_right">
                            <div id="adelieSearch" class="${this.sticky && 'adelieSearchSticky'}"></div>
                            <div id="adelieProducts" class="adelie-row"></div>
                        </div>
                        <div id="adelie_floating_cart_main" class="adelie_model_none"></div>
                        <div id="adelie_floating_cart_icon_main"></div>
                    `
        const booking = `
                            <div id="adelie_left" class="adelie_booking_left">
                                <div class="adelie_floating_cart_header adelie-top-border-radius">
                                    <h6>MY Booking</h6>
                                    <div class="adelie_floating_cart_dates">
                                        <large>${new Date(this.pickupDateTime).toLocaleDateString()}</large>
                                        <small>${new Date(this.pickupDateTime).toLocaleTimeString()}</small>
                                        <img src="./next.png" height="15px" width="15px" />
                                        <large>${new Date(this.returnDateTime).toLocaleDateString()}</large>
                                        <small>${new Date(this.returnDateTime).toLocaleTimeString()}</small>
                                    </div>
                                </div>
                                <div id="adelieBookingProducts"></div>
                                <div id="adelieBookingCalculations"></div>
                            </div>
                            <div id="adelie_right" class="adelie_booking_right"></div>
                        `
        let check = true
        if (window.location.href.split('?')[1] && window.location.href.split('?')[1].includes('true')) {
            check = false
        }
        await $('#adelie').html(check ? index : booking)
        if (check) {
            await this.listDateTime()
            await this.listingCategories()
            await this.listingSearch()
            await this.listingFloatingCartIcon()
            await this.listingFloatingCart()
            await this.listingProducts()
        }else {
            await this.ListBookingProducts()
            await this.ListBookingDetails()
            this.listingBookingFunctions(false)
        }
    }
    ListingCommonFunctions(check) {
        const a = this
        const carts = this.getCartProducts()
        $('.adelie_floating_cart_minus').on('click', function () {
            const id = $(this).attr('data-id')
            if (Object.keys(carts).includes(id)) {
                if (carts[id] >= 2) {
                    carts[id] -= 1
                }else {
                    delete carts[id]
                }
                localStorage.setItem('cart', JSON.stringify(carts))
                if (check) {
                    a.listingFloatingCartIcon()
                    a.listingFloatingCart()
                    a.listingFunctions()
                }else{
                    a.ListBookingProducts()
                    a.listingBookingFunctions(check)
                }
            }
        })
        $('.adelie_floating_cart_plus').on('click', function () {
            const id = $(this).attr('data-id')
            if (Object.keys(carts).includes(id) && a.products.find(e => e.id === id).stock > carts[id]) {
                carts[id] += 1
                localStorage.setItem('cart', JSON.stringify(carts))
                if (check) {
                    a.listingFloatingCartIcon()
                    a.listingFloatingCart()
                    a.listingFunctions()
                }else{
                    a.ListBookingProducts()
                    a.listingBookingFunctions(check)
                }
            }
        })
        $('.adelie_floating_cart_body_product_close').on('click', function () {
            const id = $(this).attr('data-id')
            if (Object.keys(carts).includes(id)){
                delete carts[id]
                localStorage.setItem('cart', JSON.stringify(carts))
                if (check) {
                    a.listingFloatingCartIcon()
                    a.listingFloatingCart()
                    a.listingFunctions()
                }else{
                    a.ListBookingProducts()
                    a.listingBookingFunctions(check)
                }
            }
        })
    }
    async listingBookingFunctions(check=false) {
        const a = this
        this.ListingCommonFunctions(check)
        $('#adelie_request_booking_button').on('click', function () {
            const result={}
            let name = $('input.adelie_booking_input[name=name]').val()
            let email = $('input.adelie_booking_input[name=email]').val()
            let phone = $('input.adelie_booking_input[name=phone]').val()
            let job = $('input.adelie_booking_input[name=job]').val()
            let note = $('input.adelie_booking_input[name=note]').val()
            if (name == '' || email == ''  || phone == '') {
                a.ListBookingDetails(
                        name == '' ? true : false,
                        email == '' ? true : false,
                        phone == '' ? true : false,
                        name,
                        email,
                        phone,
                        job,
                        note
                    )
                a.listingBookingFunctions()
                console.log('here')
            }else{
                const url = `${location.pathname}?booking=false`
                localStorage.setItem('cart', '')
                location.href = url
            }
        })
    }
    async listingFunctions() {
        var a = this
        const carts = this.getCartProducts()
        $('#top_datetime').on('change', function () {
            if (this.value !== a.returnDateTime) {
                if (this.value > a.returnDateTime) {
                    a.pickupDateTime = a.returnDateTime
                    a.returnDateTime = this.value
                    localStorage.setItem('pickupDateTime', a.returnDateTime)
                    localStorage.setItem('returnDateTime', this.value)
                } else {
                    a.pickupDateTime = this.value
                    localStorage.setItem('pickupDateTime', this.value)
                }
                a.listDateTime()
                a.listingProducts()
                a.listingFunctions()
            }
        })
        $('#bottom_datetime').on('change', function () {
            if (this.value !== a.pickupDateTime) {
                if (this.value < a.pickupDateTime) {
                    localStorage.setItem('pickupDateTime', this.value)
                    localStorage.setItem('returnDateTime', a.pickupDateTime)
                    a.returnDateTime = a.pickupDateTime
                    a.pickupDateTime = this.value
                } else {
                    localStorage.setItem('returnDateTime', this.value)
                    a.returnDateTime = this.value
                }
                a.listDateTime()
                a.listingProducts()
                a.listingFunctions()
            }
        })
        $('#SearchHandler').on('keydown', function (e) {
            let check = true
            const z = a.allProducts.filter(v => v.name.toLowerCase().includes(e.target.value.toLowerCase()))
            if (z?.length !== a?.products?.length) {
                if (e.target.value === ''){
                    a.products = a.allProducts
                }else{
                    a.products = z
                }
                check = true
            }else{
                check = false
            }
            if (check) {
                a.listingProducts()
                a.listingFunctions()
            }
        })
        $('.categoryHandler').on('click', function () {
            $('.categoryHandler').removeClass('active')
            $(this).addClass('active')
            const [id, name] = $(this).attr('data-id').split('-')
            var products = []
            if (name === 'all'){
                products = a.allProducts
            }else{
                a?.allProducts?.filter(v => {
                    v?.categories?.filter(c => {
                        if (c.name === name && c.id === id){
                            products.push(v)
                        }
                    })
                })
            }
            a.products = products
            a.listingProducts()
            a.listingFunctions()
        })
        $('.productDetailHandler').on('click', function () {
            const id = $(this).attr('data-id')
            a.productDetail = a.allProducts.find(v => v.id == id)
            a.productDetailModel = true
            a.listingProductModel()
            a.listingFunctions()
        })
        $('#adelie_model_close').on('click', function () {
            a.productDetailModel = false
            a.listingProductModel()
        })
        $('.adelie_add_to_cart').on('click', function() {
            const id = $(this).attr('data-id')
            const value = parseInt($(`#stock-${id}`).val())
            if (Object.keys(carts).includes(id)){
                carts[id] += value
            }else{
                carts[id] = value
            }
            localStorage.setItem('cart', JSON.stringify(carts))
            a.listingProductModel()
            a.listingFloatingCartIcon()
            a.listingFloatingCart()
            a.listingFunctions()
        })
        $('#adelie_floating_cart_icon_main').on('click', function () {
            $(this).addClass('adelie_model_none')
            $('#adelie_floating_cart_main').removeClass('adelie_model_none')
        })
        $('#adelie_floating_cart_close').on('click', function () {
            $('#adelie_floating_cart_main').addClass('adelie_model_none')
            $('#adelie_floating_cart_icon_main').removeClass('adelie_model_none')
        })
        this.ListingCommonFunctions(true)
    }
    async init() {
        if (this.secretKey && this.appId) {
            const client = algoliasearch(this.appId, this.secretKey)
            const index = client.initIndex('inventory')

            index.search('', {
                hitsPerPage: 50,
            // other filter and params can go here.
            }).then(({ hits }) => {
                this.products = hits
                this.allProducts = hits
                console.log(hits)
                hits?.map((v, i) => {
                    v?.categories?.map((val, ind) => {
                        if (this?.categories?.filter(e => e.name === val.name).length > 0) {
                            this?.categories?.map((v, i) => {
                                if (v?.name === val.name){
                                    v.count = v?.count + 1
                                    this.totalCategoryCount += 1
                                }
                            })
                        }else{
                            this?.categories.push({id: val.id, name:val.name, count: 1})
                            this.totalCategoryCount += 1
                        }
                        
                    })
                })
                this.listing()
                let check = true
                if (window.location.href.split('?')[1] && window.location.href.split('?')[1].includes('true')) {
                    check = false
                }
                check ? this.listingFunctions() : this.listingBookingFunctions(check)
            });
        } else {
            alert("Please provide the secret key/app id")
        }
    }
}