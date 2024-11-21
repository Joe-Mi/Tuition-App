
let Lessons = [
    {
        id:1001,
        subject:"Math",
        location:"London",
        price: 100,
        image: "",
        spaces: 5
    },
    {
        id:1001,
        subject:"Math",
        location:"Oxford",
        price: 100,
        image: "",
        Spaces: 5
    },
    {
        id:1001,
        subject:"English",
        location:"London",
        price: 100,
        image: "",
        spaces: 5
    },
    {
        id:1001,
        subject:"English",
        location:"York",
        price: 80,
        image: "",
        spaces: 5
    },
    {
        id:1001,
        subject:"Music",
        location:"Bristol",
        price: 90,
        image: "",
        spaces: 5
    }
]

var app = new Vue({
    el: "#app",
    data() {
        return {
            showLessons: true,
            Lessons:Lessons,
            order: {
                Fname: ``,
                Lname: ``,
                Phone: ``
            },
            Tuitions: [ ]
        };
    },
    created:function(){
        fetch("http://localhost:3000/collections/products").then(
            function(response) {
                response.json().then(
                    function(json) {
                        webstore.products = json;
                        console.log(webstore.products);
                    }
                )
            }
        );
    },
    methods: {
        addToCart(lesson) {
            this.Tuitions.push(lesson.id);
            lesson.spaces -= 1;
            console.log(this.Tuitions.lenght);
        }, 
        showCheckUot() {
            if(this.showLessons) {
                this.showLessons = false;
            } else {
                this.showLessons = true;
            }
        },
        CanAddToCart(lesson) {
            return lesson.spaces >= 1;
        },
        cartCount(lesson) {
            let count = 0;
            for(let i = 0; i < this.Tuitions.lenght; i++) {
                if(this.Tuitions[i] === lesson.id){
                    count ++
                }
            }
            return count;
        },
        itemleft(lesson) {
            return lesson.spaces;
        }
    },
    computed: {
        itemsInCart:function() {
            return this.Tuitions.lenght || "";
        }
    }
})