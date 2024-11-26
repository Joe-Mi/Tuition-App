
var app = new Vue({
    el: "#app",
    data() {
        return {
            showLessons: true,
            sortOrder:1,
            Lessons:{},
            order: {
                Fname: ``,
                Lname: ``,
                Phone: ``
            },
            filter: {
                method: 1,
                order: 1
            },
            Tuitions: [],
            status: []
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
            this.Tuitions.push(lesson);
            lesson.spaces -= 1;
            console.log(this.Tuitions.length);
        },
        removeLesson(lesson) {
            let arr = this.Tuitions;
            let i = this.Tuitions.length;
            while(i--){
                if(arr[i].id == lesson.id && arr[i].subject == lesson.subject){
                    lesson.spaces += 1;
                    this.Tuitions.splice(i, 1);
                    break
                }
            }   
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
        sortLessons() {
            filter = this.filter
            const compareDict = { 
                1: (a, b) => a.subject.localeCompare(b.subject), 
                2: (a, b) => a.location.localeCompare(b.location), 
                3: (a, b) => a.spaces - b.spaces, 
                4: (a, b) => a.price - b.price 
            }; 
            const compare = compareDict[this.filter.method]; 
            const order = this.filter.order ;

            return this.Lessons.sort((a, b) => order * compare(a, b));
        },
        Checker(){

        },
        validateForm() { 
            if (!this.order.Fname || this.order.Fname.length < 2) { 
                this.status.push("First name must be at least 2 characters long."); 
            } if (!this.order.Lname || this.order.Lname.length < 2) { 
                this.status.push("Last name must be at least 2 characters long."); 
            }

            const phonePattern = /^\d{10}$/; 
            if (!phonePattern.test(this.order.Phone)) 
                { 
                    this.status.push("Phone number must be 10 digits.");
                } 
            return this.status.length === 0;
        },
        async postData() {
            let data = this.order;
            if (this.validateForm()) {
                try{
                const response = await fetch('/collections/Orders', { 
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                console.log(response.status);
                const result = await response.json(); 
                console.log('Success:', result);
                this.status.length === 0;S
                this.status.push("Your order has been placed."); 
                return result;
                }catch(err){
                    console.error(err.message);
                }
            }else { 
                console.error('Validation errors:', this.status); 
            }
        }
    },
    computed: {
        itemsInCart:function() {
            return this.Tuitions.length || "";
        },
        CanCheckout:function() {
            return this.Tuitions.length > 0;
        },
        isFormValid:function() { 
            return this.order.Fname && this.order.Lname && this.order.Phone 
            && /^\d{10}$/.test(this.order.Phone);
        }
    }
})