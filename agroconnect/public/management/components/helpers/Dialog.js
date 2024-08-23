// Class Dialog
class Dialog {
    /**
     * State of the Input Dialog OK (1)
     */
    static OK = 1;
    /**
     * State of the Input Dialog CANCEL (0)
     */
    static CANCEL = 0;

    /**
     * method of Dialog Class that allows user input
     * @param {innerText} textTitle Title of the dialog (only plain text)
     * @param {innerHTML} textMessage Message of the dialog for user input (allows element tags)
     * @returns data of dialog upon resolve().
     */
    static async confirmDialog(textTitle, textMessage) {
        // create elemeents
        const inputDialog = document.createElement('dialog');
        const title = document.createElement('h4');
        const message = document.createElement('p');
        const divButtons = document.createElement('div');
        const btnOk = document.createElement('button');
        const btnCancel = document.createElement('button');
        // add attributes
        inputDialog.setAttribute('id', 'inputDialog');
        title.setAttribute('id', 'title');
        message.setAttribute('id', 'message');
        divButtons.setAttribute('id', 'divButtons');
        btnOk.setAttribute('id', 'btnOk');
        btnOk.innerText = 'OK';
        btnCancel.setAttribute('id', 'btnCancel');
        btnCancel.innerText = 'Cancel';

        // append the elements
        divButtons.append(btnOk, btnCancel);
        inputDialog.append(title, message, divButtons);
        $('body').prepend(inputDialog);

        /**
         * dialogData       =   contains the data of the input dialog
         * 
         * output           =   output of the dialog (input). null is default value
         * outputLength     =   length of the output
         * operation        =   operations of the buttons in dialog. 0 is default value
         *                      1 - OK
         *                      0 - CANCEL
         */
        const dialogData = {
            operation: 0,
        };

        return new Promise((resolve) => {
            if (!inputDialog.open) {
                // Display the modal with the message
                inputDialog.showModal();

                // show the message
                title.innerText = textTitle;
                message.innerHTML = textMessage;
                btnOk.addEventListener('click', () => {
                    // close the dialog
                    inputDialog.close();

                    // remove the element                                       
                    $(inputDialog).remove();

                    dialogData.operation = 1;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                });

                btnCancel.addEventListener('click', () => {
                    // close the dialog
                    inputDialog.close();

                    // remove the element
                    $(inputDialog).remove();

                    // update the data of dialog
                    dialogData.operation = 0;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                });
            }
        });
    }

    /**
     * Method of Dialog Class that allows user to change password
     * @param {innerText} textTitle Title of the dialog (only plain text)
     * @param {innerHTML} textMessage Message of the dialog (allows element tags)
     * @returns {Promise} Promise that resolves with the dialog data including the new password if OK is clicked.
     */
    static async changePasswordDialog(textTitle, textMessage) {
        // Create elements
        const inputDialog = document.createElement('dialog');
        const title = document.createElement('h4');
        const message = document.createElement('p');
        const form = document.createElement('form');
        const newPasswordInput = document.createElement('input');
        const confirmPasswordInput = document.createElement('input');
        const divButtons = document.createElement('div');
        const btnSave = document.createElement('button');
        const btnCancel = document.createElement('button');
        const errorMessage = document.createElement('p');

        // Add attributes and text
        newPasswordInput.setAttribute('class', 'form-control mb-3');
        confirmPasswordInput.setAttribute('class', 'form-control');
        inputDialog.setAttribute('id', 'inputDialog');
        title.setAttribute('id', 'title');
        message.setAttribute('id', 'message');
        divButtons.setAttribute('id', 'divButtons');
        btnSave.setAttribute('id', 'btnSave');
        btnSave.innerText = 'Save';
        btnCancel.setAttribute('id', 'btnCancel');
        btnCancel.innerText = 'Cancel';

        newPasswordInput.setAttribute('type', 'password');
        newPasswordInput.setAttribute('placeholder', 'New Password');
        newPasswordInput.setAttribute('id', 'newPassword');

        confirmPasswordInput.setAttribute('type', 'password');
        confirmPasswordInput.setAttribute('placeholder', 'Confirm Password');
        confirmPasswordInput.setAttribute('id', 'confirmPassword');

        errorMessage.setAttribute('id', 'errorMessage');
        errorMessage.style.color = 'red';

        // Append elements
        form.append(newPasswordInput, confirmPasswordInput, errorMessage);
        divButtons.append(btnSave, btnCancel);
        inputDialog.append(title, message, form, divButtons);
        document.body.prepend(inputDialog);

        const dialogData = {
            operation: 0,
            newPassword: null
        };

        return new Promise((resolve) => {
            // Display the modal with the message
            inputDialog.showModal();

            // Show the message
            title.innerText = textTitle;
            message.innerHTML = textMessage;

            btnSave.addEventListener('click', () => {
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();

                if (newPassword === confirmPassword) {
                    // Close the dialog
                    inputDialog.close();
                    $(inputDialog).remove();

                    dialogData.operation = 1;
                    dialogData.newPassword = newPassword;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                } else {
                    // Show error message
                    errorMessage.innerText = 'Passwords do not match. Please try again.';
                }
            });

            btnCancel.addEventListener('click', () => {
                // Close the dialog
                inputDialog.close();
                $(inputDialog).remove();

                // Resolve the promise to indicate that the modal has been closed
                resolve(dialogData);
            });

            newPasswordInput.addEventListener('input', validatePasswords);
            confirmPasswordInput.addEventListener('input', validatePasswords);

            function validatePasswords() {
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();
                
                // Regular expression to check if the password contains both letters and numbers
                const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
                
                if (newPassword !== confirmPassword && confirmPassword.length > 0) {
                    errorMessage.innerText = 'Passwords do not match.';
                } else if (!hasLettersAndNumbers.test(newPassword)) {
                    errorMessage.innerText = 'Password must be at least 8 characters \nand include both letters and numbers.';
                } else {
                    errorMessage.innerText = '';
                }
            }
            
        });
    }
}

export default Dialog;