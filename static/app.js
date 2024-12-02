https://tuition-app-1.onrender.com
var app = new Vue({
    el: "#app",
    data() {
        return {
            showLessons: true,
            sortOrder:1,
            Lessons:[],
            Tuitions:[],
            searchResults: [],
            order: {
                Fname: ``,
                Lname: ``,
                Phone: ``,
                items: {}
            },
            filter: {
                method: 1,
                order: 1
            },
            search: '',
            status: []
        };
    },
    created:function(){ // After the vue app is initialised a GET request is made.
        fetch("https://tuition-app-1.onrender.com/collections/Lessons").then(
            function(response) {
                response.json().then(
                    function(json) {
                        app.Lessons = json;//returning an arry of objects form the back-end.
                        console.log(app.Lessons);
                    }
                )
            }
        );
    },
    methods: {
        addToCart(lesson) { // this fuction adds objectinto the cart.
            this.Tuitions.push(lesson);
            if(lesson.id in this.order.items){//As well As Updating the lessosn details.
                this.order.items[lesson.id] += 1
            } else{
                this.order.items[lesson.id] = 1;
            }
            lesson.spaces -= 1;
            console.log(this.order.items);
        },
        removeLesson(lesson) {//This removes lessons from the order.items.
            let arr = this.Tuitions;
            let i = this.Tuitions.length;
            while(i--){
                if(arr[i].id == lesson.id && arr[i].subject == lesson.subject){
                    lesson.spaces += 1;//updating the lessons details
                    this.Tuitions.splice(i, 1);//Removing the Lesson from the Tuition array.
                    break
                }
            }   
        },
        showCheckUot() {//This function is used to disable or enable the checkout page.
            if(this.showLessons) {
                this.showLessons = false;
            } else {
                this.showLessons = true;
            }
        },
        CanAddToCart(lesson) {//This function disables the addTocart button.
            return lesson.spaces >= 0;//In the event the spaces/availability are less than zero.
        },
        sortLessons() {//This function sort the lesson array.
            filter = this.filter
            const compareDict = {//depending on the option it sort the array on subject, laction, etc.
                1: (a, b) => a.subject.localeCompare(b.subject), 
                2: (a, b) => a.location.localeCompare(b.location), 
                3: (a, b) => a.spaces - b.spaces, 
                4: (a, b) => a.price - b.price 
            }; 
            const compare = compareDict[this.filter.method]; 
            const order = this.filter.order ;

            return this.Lessons.sort((a, b) => order * compare(a, b));
        },
        async searchCollection(){// This function Searches a Collection for a Object.
            try{
                data = this.search//the Data is stored in the url to apss the query parameters to the back-end.
                const response = await fetch(`/collections/Lessons/${encodeURIComponent(data)}`, { 
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });

                if (!response.ok) { 
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log(response.status);
                const result = await response.json(); 
                console.log('Success:', result);
                this.searchResults = result;//This returns an array of objects used to update the displayed lessons.

                if (!result.length) { 
                    console.log('No lessons found for the given search term.');
                }
            } catch(err) {
                console.error(err.message);
            }
        },
        async updateCollection(data){//This function updates the lessons collection after an order is placed.
            try{
                id = data._id//We use the ObjectID to find the required object.
                const response = await fetch(`/collections/Lessons/${id}`, { 
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({spaces: data.spaces})
                });

                if (!response.ok) { 
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log(response.status);
                const result = await response.json(); 
                console.log('Success:', result);//Prints the result to verify the Update.
                return result;
            }catch(err){
                console.error(err.message);
            }
        },
        async doublecheck(){//This fuction lops through the lessons array updating colletion.
            try{
                for(let i = 0; i < this.Lessons.length; i++){
                    if(this.Lessons[i].id in this.order.items){
                        await this.updateCollection(this.Lessons[i]);//It only updates items present in order.items.
                    }
                }
                return console.log("update succesful.");
            } catch(err) {
                console.error('Error during update:', err.message);
            }
        },
        validateForm() {//This function validates the User input before posting the order. 
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
        async postData() {//This function posts orders into the Orders collection.
            let data = this.order;
            if (this.validateForm()) {//It first validates the inputs to ensure no erros are present. 
                try{
                const response = await fetch('/collections/Orders', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                console.log(response.status);
                const result = await response.json(); 
                console.log('Success:', result);

                this.status.length === 0;
                this.doublecheck();
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
        },
        filteredLessons:function() {
            if (this.searchResults.length === 0) { 
                return this.Lessons;
            }
            return this.Lessons.filter(lesson => this.searchResults.some(result => result.id === lesson.id));
        }
    }
})
