(function(window, document, undefined) {

    // pane elements
    var rightPane = document.getElementById('right-pane');
    var leftPane = document.getElementById('left-pane');

    // script elements that correspond to Handlebars templates
    var questionTemplate = document.getElementById('questions-template');
    var questionFormTemplate = document.getElementById('question-form-template');
    var expandedQuestionTemplate = document.getElementById('expanded-question-template')

     // compiled Handlebars templates
    var templates = {
        renderQuestion: Handlebars.compile(questionTemplate.innerHTML),
        renderQuestionForm: Handlebars.compile(questionFormTemplate.innerHTML),
        expandedQuestionForm: Handlebars.compile(expandedQuestionTemplate.innerHTML)
    };

    //when page refreshes, automatically fill in previous questions
    if (localStorage.questions) {
        questionsList = getStoredQuestions();
        var finalHTML = templates.renderQuestion({
                questions: questionsList
        });
        leftPane.innerHTML = finalHTML
    }


    /* Returns the questions stored in localStorage. */
    function getStoredQuestions() {
        if (!localStorage.questions) {   // default to empty array
            localStorage.questions = JSON.stringify([]);
        }
        return JSON.parse(localStorage.questions);
    }

    /* Store the given questions array in localStorage.
     *
     * Arguments:
     * questions -- the questions array to store in localStorage
     */
    function storeQuestions(questions) {
        if(questions.subject=='' && questions.question=='') return;
        localStorage.questions = JSON.stringify(questions);
    }


    // display question form initially
    rightPane.innerHTML = templates.renderQuestionForm();

    function addSubmitListener(){
        var questionForm = document.getElementById('question-form');

        questionForm.addEventListener("submit",function(event){
            event.preventDefault();
            var subjectInput = questionForm.subject
            var questionInput = questionForm.question
            if(subjectInput.value==='' && questionInput.value==='') return;
            var questionsList = getStoredQuestions()
            questionsList.push({
                subject: subjectInput.value,
                question: questionInput.value,
                id: Math.floor(Math.random() * 10000),
                responses: []
            });
            var finalHTML = templates.renderQuestion({
                questions: questionsList
            });

            subjectInput.value = '';
            questionInput.value = '';

            leftPane.innerHTML = finalHTML
            storeQuestions(questionsList);

        });
    }
    addSubmitListener();

    function fillRightPane(id){
        questionClass = document.getElementById('right-panel-question')
        if (localStorage.questions) {
            questionsList = getStoredQuestions()
            var question
            for(var i=0;i<questionsList.length;i++){
                if(questionsList[i].id == id){ //== because one is string one is int
                    question = questionsList[i]
                }
            }
            finalHTML = templates.expandedQuestionForm(question)
            rightPane.innerHTML = finalHTML;
        }
        var resolve = document.getElementById('resolve')
        resolve.addEventListener("click",function(event){
            var questionsList = getStoredQuestions()
            removeIndex = -1;
            for(var i=0;i<questionsList.length;i++){
                if(questionsList[i].id == id){ //== because one is string one is int
                    removeIndex = i
                }
            }
            questionsList.splice(removeIndex,1)
            storeQuestions(questionsList);
            var finalHTML = templates.renderQuestion({
                questions: questionsList
            });
            leftPane.innerHTML = finalHTML
            var rightPaneHTML = templates.renderQuestionForm()
            rightPane.innerHTML = rightPaneHTML
            addSubmitListener();
            addLeftPaneListener();
        })
    }

    function addResponseForm(id){
        var responseForm = document.getElementById('response-form');
        var nameInput;
        var responseInput;
        responseForm.addEventListener('submit',function(event){
            event.preventDefault();
            nameInput = responseForm.name.value;
            responseInput = responseForm.response.value;
            if(responseInput=='') return;
            response = {
                name : nameInput,
                response : responseInput
            }
            questionsList = getStoredQuestions()
            var question
            for(var i=0;i<questionsList.length;i++){
                if(questionsList[i].id == id){ //== because one is string one is int
                    questionsList[i].responses.push(response)
                    question = questionsList[i]
                }
            }
            storeQuestions(questionsList)
            questionClass = document.getElementById('right-panel-question')
            responseForm.children[0].innerHTML= '';
            responseForm.children[1].innerHTML = '';
            fillRightPane(id);
            addResponseForm(id);
        });

    }

    function addLeftPaneListener(){
        leftPane.addEventListener("click",function(event){
            event.preventDefault();
            var target = event.target;
            while(target.className !== undefined && target.className.indexOf('question-info')==-1){
                target = target.parentNode;
            }
            if(target==window) return;
            questionsList = getStoredQuestions()
            var question
            for(var i=0;i<questionsList.length;i++){
                if(questionsList[i].id == target.id){ //== because one is string one is int
                    question = questionsList[i]
                }
            }
            if(question===undefined) return;
            finalHTML = templates.expandedQuestionForm(question)
            rightPane.innerHTML = finalHTML
            fillRightPane(target.id);
            addResponseForm(target.id);
        });
    }
    addLeftPaneListener();


    var newQuestionForm = document.getElementById('interactors');
    newQuestionForm.addEventListener("click",function(event){
        event.preventDefault();
        var rightPaneHTML = templates.renderQuestionForm()
        rightPane.innerHTML = rightPaneHTML
        addSubmitListener();

    });

    //Extension: Search bar, if something is typed and enter is pressed, it will filter
    //the questions with that search term in any of its fields. If nothing is typed
    //and enter is pressed, it will display all the questions
    var ENTER_KEY_CODE = 13;
    var search = document.getElementById('search');
    search.addEventListener('keydown',function(event){
        var questionsList = getStoredQuestions()
        if(search.value!=='' && event.keyCode === ENTER_KEY_CODE){
            var searchTerm = search.value;
            var finalHTML = templates.renderQuestion({
                questions: questionsList
            });
            var tempQuestionsList = []
            for(var i=0;i<questionsList.length;i++){
                var list = questionsList[i]
                var contains = false
                if(list.subject.indexOf(searchTerm)!==-1){
                    contains = true
                }else if(list.question.indexOf(searchTerm)!==-1){
                    contains = true
                }else if(list.responses!==[]){
                    for(var j=0;j<list.responses.length;j++){
                        var response = list.responses[j]
                        if(response.name.indexOf(searchTerm)!==-1){
                            contains = true
                        }else if(response.response.indexOf(searchTerm)!==-1){
                            contains = true
                        }
                    }
                }
                if(contains){
                    tempQuestionsList.push(list)
                }
            }
            var finalHTML = templates.renderQuestion({
                questions: tempQuestionsList
            });
            leftPane.innerHTML = finalHTML

        }else if(search.value==''){
            var finalHTML = templates.renderQuestion({
                questions: questionsList
            });
            leftPane.innerHTML = finalHTML
        }

    });

})(this, this.document);
