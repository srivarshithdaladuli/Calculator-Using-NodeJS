/**
 * Calculator Application
 * A simple calculator with safe expression evaluation
 */

const Calculator = {
    currentInput: '',
    displayElement: null,

    init() {
        this.displayElement = document.getElementById('display');
        this.setupKeyboardSupport();
    },

    appendToDisplay(value) {
        // Prevent multiple operators in a row
        const lastChar = this.currentInput.slice(-1);
        const operators = ['+', '-', '*', '/'];
        
        if (operators.includes(value) && operators.includes(lastChar)) {
            return;
        }
        
        // Prevent multiple decimal points in the same number
        if (value === '.') {
            const parts = this.currentInput.split(/[+\-*/]/);
            const currentNumber = parts[parts.length - 1];
            if (currentNumber.includes('.')) {
                return;
            }
        }
        
        this.currentInput += value;
        this.updateDisplay();
    },

    clearDisplay() {
        this.currentInput = '';
        this.updateDisplay();
    },

    backspace() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateDisplay();
    },

    calculate() {
        try {
            const result = this.safeEvaluate(this.currentInput);
            this.currentInput = result !== null ? String(result) : 'Error';
        } catch (error) {
            this.currentInput = 'Error';
        }
        this.updateDisplay();
    },

    /**
     * Safely evaluate a mathematical expression without using eval()
     * Supports: +, -, *, / and decimal numbers
     */
    safeEvaluate(expression) {
        // Validate the expression contains only allowed characters
        if (!/^[0-9+\-*/.\s]+$/.test(expression)) {
            return null;
        }

        // Remove whitespace
        expression = expression.replace(/\s/g, '');

        // Handle empty expression
        if (expression === '') {
            return 0;
        }

        // Tokenize the expression
        const tokens = this.tokenize(expression);
        if (!tokens) {
            return null;
        }

        // Parse and evaluate using proper operator precedence
        return this.parseExpression(tokens);
    },

    tokenize(expression) {
        const tokens = [];
        let current = '';

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];

            if ('0123456789.'.includes(char)) {
                current += char;
            } else if ('+-*/'.includes(char)) {
                if (current) {
                    tokens.push(parseFloat(current));
                    current = '';
                } else if (char === '-' && (tokens.length === 0 || '+-*/'.includes(tokens[tokens.length - 1]))) {
                    // Handle negative numbers
                    current = '-';
                    continue;
                }
                tokens.push(char);
            }
        }

        if (current) {
            tokens.push(parseFloat(current));
        }

        return tokens;
    },

    parseExpression(tokens) {
        // First pass: handle * and /
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] === '*' || tokens[i] === '/') {
                const left = tokens[i - 1];
                const right = tokens[i + 1];
                let result;

                if (tokens[i] === '*') {
                    result = left * right;
                } else {
                    if (right === 0) {
                        return null; // Division by zero
                    }
                    result = left / right;
                }

                tokens.splice(i - 1, 3, result);
                i--;
            }
            i++;
        }

        // Second pass: handle + and -
        i = 0;
        while (i < tokens.length) {
            if (tokens[i] === '+' || tokens[i] === '-') {
                const left = tokens[i - 1];
                const right = tokens[i + 1];
                const result = tokens[i] === '+' ? left + right : left - right;

                tokens.splice(i - 1, 3, result);
                i--;
            }
            i++;
        }

        // Round to avoid floating point errors
        const result = tokens[0];
        return Math.round(result * 1000000000) / 1000000000;
    },

    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.value = this.currentInput;
        }
    },

    setupKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;

            if ('0123456789'.includes(key)) {
                this.appendToDisplay(key);
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                this.appendToDisplay(key);
            } else if (key === '.') {
                this.appendToDisplay('.');
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                this.calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                this.clearDisplay();
            } else if (key === 'Backspace') {
                this.backspace();
            }
        });
    }
};

// Legacy function wrappers for HTML onclick handlers
function appendToDisplay(value) {
    Calculator.appendToDisplay(value);
}

function clearDisplay() {
    Calculator.clearDisplay();
}

function calculate() {
    Calculator.calculate();
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Calculator.init();
});
