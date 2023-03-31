import React, { useEffect, useState } from 'react'
import $ from 'jquery'

function Payment() {

    const [state, setState] = useState({
        firstName: '',
        lastName: '',
        expDate: '',
        creditNumber: '',
        cvv: '',
        zipCode: '',
        formMessage: false
    })


    // Luhn Check Validation  https://learnersbucket.com/examples/javascript/credit-card-validation-in-javascript
    const validateCardNumber = number => {
        //Check if the number contains only numeric value  
        //and is of between 13 to 19 digits
        const regex = new RegExp("^[0-9]{13,19}$");
        if (!regex.test(number)){
            return false;
        }
      
        return luhnCheck(number);
    }    
    const luhnCheck = val => {
        let checksum = 0; // running checksum total
        let j = 1; // takes value of 1 or 2
    
        // Process each digit one by one starting from the last
        for (let i = val.length - 1; i >= 0; i--) {
          let calc = 0;
          // Extract the next digit and multiply by 1 or 2 on alternative digits.
          calc = Number(val.charAt(i)) * j;
    
          // If the result is in two digits add 1 to the checksum total
          if (calc > 9) {
            checksum = checksum + 1;
            calc = calc - 10;
          }
    
          // Add the units element to the checksum total
          checksum = checksum + calc;
    
          // Switch the value of j
          if (j == 1) {
            j = 2;
          } else {
            j = 1;
          }
        }
      
        //Check if it is divisible by 10 or not.
        return (checksum % 10) == 0;
    }

    // POST the credit card information to the server
    const postCreditInfo = async () => {
        await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                creditNumber: state.creditNumber,
                cvv: state.cvv,
                expDate: state.expDate,
                firstName: state.firstName,
                lastName: state.lastName,
                zipCode: state.zipCode
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => {
                console.log(json)
                // Shows the success message under the form.
                const messageBox = $('.form-message');              
                messageBox.empty().addClass('form-success').append(`Submitted! Order #${json.id}`)
            })
            .catch(err => console.error(err));
    }

    let isValid = validateCardNumber(state.creditNumber)

    // When the user submits the form
    const handleSubmit = (e) => {
        e.preventDefault()
        if (isValid) { postCreditInfo() } // posts to /posts
        
    }

    // Handles the credit card number display
    function getDisplayCardNumber(numberInput) {
        const placeholder = "****************";
        const newPlaceholder = placeholder.substr(numberInput.length);
        
        const checkValid = $('.checkValid');  

        // Adds error message when not a valid credit card number when checked against validateCardNumber()
        (!isValid) ? checkValid.empty().append('Not a valid credit card number').addClass('error') : checkValid.hide();

        return numberInput.concat("", newPlaceholder).match(/.{1,4}/g);
    }
    let cardNumber = getDisplayCardNumber(state.creditNumber);

    // Handles the Expiration Date display
    function getDisplayExpDate(expInput) {
        let expiry = expInput.match(/.{1,2}/g)
        let expiryOutput = `${expiry[0]}/${(expiry[1]) ? expiry[1] : ''}`
        return expiryOutput
    }

    // Handles the state of the input values and what will display on the credit card display.
    function handleInputChange(event) {
       // console.log(event.target.id + ' ' + event.target.value);
        const value = event.target.value

        setState({ ...state, [event.target.id]: value })

        console.log(validateCardNumber(state.creditNumber));
    }

    // Found function I wanted to use  https://codepen.io/mikeumus/pen/OBoVoX
    const inputMatchesPattern = function (e) {
        const {
            value,
            selectionStart,
            selectionEnd,
            pattern
        } = e.target;

        const character = String.fromCharCode(e.which);
        const proposedEntry = value.slice(0, selectionStart) + character + value.slice(selectionEnd);
        const match = proposedEntry.match(pattern);

        return e.metaKey || // cmd/ctrl
            e.which <= 0 || // arrow keys
            e.which == 8 || // delete key
            match && match["0"] === match.input; // pattern regex isMatch - workaround for passing [0-9]* into RegExp
    };
    document.querySelectorAll('input[data-pattern-validate]').forEach(el => el.addEventListener('keypress', e => {
        if (!inputMatchesPattern(e)) {
            return e.preventDefault();
        }
    }));

    


    

    return (
        <div className='payment-container'>
            <header className='payment-header'>
                <h1>Pay with Credit Card</h1>
            </header>

            {/* Credit Card Display */}
            <div className='creditCard-container'>
                <div className='creditCard-front'>
                    <span className='creditCard-logo'></span>
                    <div className='creditCard-front-info'>
                        <div className='creditCard-number'>
                            <span className="numberSection">{cardNumber[0]}</span>
                            <span className="numberSection">{cardNumber[1]}</span>
                            <span className="numberSection">{cardNumber[2]}</span>
                            <span className="numberSection">{cardNumber[3]}</span>
                            {cardNumber[4] && (
                                <span className="numberSection">{cardNumber[4]}</span>
                            )}
                        </div>
                        <div className='creditCard-fullName'>{state.firstName ? state.firstName : 'YOUR NAME'} {state.lastName ? state.lastName : ''}</div>
                        <div className='creditCard-expiry'>
                            <span>EXPIRY</span>
                            <span>{state.expDate ? getDisplayExpDate(state.expDate) : 'MM/YY'}</span>
                        </div>
                    </div>
                </div>
                <div className='creditCard-back'>
                    <div className='creditCard-back-info'>
                        <div className='creditCard-cvv'>
                            <span>CVV</span>
                            <span>{state.cvv ? state.cvv : 'XXX'}</span>
                        </div>
                    </div>
                </div>
            </div>


            <form className='creditCard-form' onSubmit={handleSubmit}>
                <ul>
                    <li>
                        <label htmlFor='creditNumber'>Credit Card Number
                                <span className='tooltip'>?
                                    <span id="tool-1" className='tooltip-text' role='tooltip' >Tooltip Text</span>
                                </span>
                        </label>
                        <input
                            autoFocus
                            id="creditNumber"
                            name="number"
                            type="text"
                            placeholder="**** **** **** ****"
                            minLength='15'
                            maxLength='16'
                            pattern='^[0-9]*$'
                            required
                            aria-describedby="tool-1"
                            value={state.creditNumber}
                            onChange={handleInputChange}
                            data-pattern-validate
                        />
                        <span className='checkValid'></span>
                    </li>
                    <li>
                        <label htmlFor='expDate'>Expiration Date</label>
                        <input
                            id="expDate"
                            type="text"
                            name="expDate"
                            placeholder="MM/YY"
                            pattern='^[0-9]*$'
                            minLength='4'
                            maxLength='4'
                            required
                            value={state.expDate}
                            onChange={handleInputChange}
                            data-pattern-validate
                        />
                    </li>

                    <li>
                        <label htmlFor='cvv'>CVV
                            <span className='tooltip'>?
                            <span id="tool-2" className='tooltip-text' role='tooltip'>Tooltip Text</span>
                            </span>
                        </label>
                        <input
                            id="cvv"
                            type="text"
                            name="cvv"
                            placeholder="XXX"
                            required
                            pattern='^[0-9]*$'
                            aria-describedby="tool-2"
                            minLength="3"
                            maxLength="4"
                            value={state.cvv}
                            onChange={handleInputChange}
                            data-pattern-validate
                        />
                    </li>

                    <li>
                        <label htmlFor="firstName">Cardholder's First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name='firstName'
                            placeholder='First name'
                            required
                            value={state.firstName}
                            onChange={handleInputChange}
                        />
                    </li>

                    <li>
                        <label htmlFor="lastName">Cardholder's Last Name</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            minLength="1"
                            maxLength="40"
                            placeholder='Last name'
                            required
                            value={state.lastName}
                            onChange={handleInputChange}
                        />
                    </li>

                    <li>
                        <label htmlFor='zipCode'>Billing Zip Code</label>
                        <input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            required
                            minLength="5"
                            maxLength="9"
                            placeholder='XXXXXX'
                            pattern='^[0-9]*$'
                            value={state.zipCode}
                            onChange={handleInputChange}
                            data-pattern-validate

                        />
                    </li>
                </ul>
                
                <input type="submit" role="button" title="Submit credit card information" />
            </form>

            <p className='form-message'></p>
            
        </div>
    )
}

export default Payment