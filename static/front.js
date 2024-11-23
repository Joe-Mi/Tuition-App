
var app = new Vue({
    el: "#app",
    data() {
        return {
            showLessons: true,
            Lessons:{},
            order: {
                Fname: ``,
                Lname: ``,
                Phone: ``
            },
            Tuitions: [ ]
        };
    },
    created:function(){
        fetch("http://localhost:3000/collections/Lessons").then(
            function(response) {
                response.json().then(
                    function(json) {
                        app.Lessons = json;
                        console.log(app.Lessons);
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
        },
        async postData() {
            let data = this.order;
            console.log('Posting: ', data);
            try{
                const response = await fetch('/collections/Orders', { 
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });

                console.log(response.status);
                const result = await response.json(); 
                console.log('Success:', result); 
                return result;
            }catch(err){
                console.error(err.message);
            }
        }
    },
    computed: {
        itemsInCart:function() {
            return this.Tuitions.lenght || "";
        }
    }
})