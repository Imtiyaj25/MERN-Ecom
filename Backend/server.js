// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://imsayyad97:bI5UcloPFmoEFzly@cluster0.2xxbflz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Customer schema
const customerSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  age: Number,
  monthly_income: Number,
  approved_limit: Number,
  phone_number: Number
});

const Customer = mongoose.model('Customer', customerSchema);

// Define Loan schema
const loanSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  loan_amount: Number,
  tenure: Number,
  interest_rate: Number,
  emi: Number,
  approved: Boolean
});

const Loan = mongoose.model('Loan', loanSchema);

// API Endpoint to register a new customer
app.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, age, monthly_income, phone_number } = req.body;

    // Calculate approved limit
    const approved_limit = Math.round(36 * monthly_income / 100000) * 100000;

    // Create new customer
    const customer = new Customer({ first_name, last_name, age, monthly_income, approved_limit, phone_number });
    await customer.save();

    res.json({
      customer_id: customer._id,
      name: `${customer.first_name} ${customer.last_name}`,
      age: customer.age,
      monthly_income: customer.monthly_income,
      approved_limit: customer.approved_limit,
      phone_number: customer.phone_number
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint to check loan eligibility
app.post('/check-eligibility', async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Query customer and past loan data
    const customer = await Customer.findById(customer_id);
    const loans = await Loan.find({ customer_id });

    // Implement your logic to calculate credit score based on historical loan data

    // Example logic for credit score calculation
    let creditScore = 80; // Assume default credit score
    const sumCurrentLoans = loans.reduce((sum, loan) => sum + loan.emi, 0);
    if (sumCurrentLoans > customer.approved_limit) {
      creditScore = 0;
    }

    // Determine loan approval based on credit score
    let loanApproval = false;
    let interestRate = interest_rate;
    let loanAmount = loan_amount;
    
    if (creditScore > 50) {
      loanApproval = true;
    } else if (creditScore > 30) {
      interestRate = 12;
      loanApproval = true;
    } else if (creditScore > 10) {
      interestRate = 16;
      loanApproval = true;
    }
 // Calculate corrected interest rate based on credit score
 let correctedInterestRate = interestRate;
 if (interestRate === 0) {
   correctedInterestRate = 16; // Assuming lowest slab if credit score is 0
 }


 // Calculate monthly installment
 function calculateMonthlyInstallment(loanAmount, tenure, interestRate) {
  const monthlyInterestRate = interestRate / 1200; // Convert annual interest rate to monthly
  const denominator = Math.pow(1 + monthlyInterestRate, tenure) - 1;
  const emi = loanAmount * monthlyInterestRate / denominator;
  return emi;
}
 const monthlyInstallment = calculateMonthlyInstallment(loanAmount, tenure, interestRate);

 res.json({
   customer_id,
   approval: loanApproval,
   interest_rate: interestRate,
   corrected_interest_rate: correctedInterestRate,
   tenure: 12, // Assuming tenure of 12 months for simplicity
   monthly_installment: monthlyInstallment
 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// API Endpoint to create a new loan
// API Endpoint to create a new loan
app.post('/create-loan', async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Check eligibility
    const eligibilityResponse = await checkEligibility(customer_id);
    if (!eligibilityResponse || !eligibilityResponse.loanApproval) {
      return res.status(400).json({ message: 'Loan cannot be approved based on eligibility criteria' });
    }
    
    // Calculate monthly installment
    const monthlyInstallment = calculateMonthlyInstallment(loan_amount, tenure, interest_rate);

    // Create new loan
    const loan = new Loan({
      customer_id,
      loan_amount,
      tenure,
      interest_rate,
      emi: monthlyInstallment,
      approved: true
    });
    await loan.save();

    res.json({
      loan_id: loan._id,
      customer_id: loan.customer_id,
      loan_approved: loan.approved,
      message: 'Loan approved successfully',
      monthly_installment: loan.emi
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint to view loan details by loan_id
app.get('/view-loan/:loan_id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loan_id).populate('customer_id', 'first_name last_name phone_number age');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json({
      loan_id: loan._id,
      customer: {
        id: loan.customer_id._id,
        first_name: loan.customer_id.first_name,
        last_name: loan.customer_id.last_name,
        phone_number: loan.customer_id.phone_number,
        age: loan.customer_id.age
      },
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      monthly_installment: loan.emi,
      tenure: loan.tenure
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint to make payment towards an EMI
app.post('/make-payment/:customer_id/:loan_id', async (req, res) => {
  try {
    const { customer_id, loan_id } = req.params;
    const paymentAmount = req.body.paymentAmount;

    const loan = await Loan.findById(loan_id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Calculate remaining balance
    const remainingBalance = loan.emi - paymentAmount;

    if (remainingBalance < 0) {
      return res.status(400).json({ message: 'Payment amount exceeds the due installment' });
    }

    // Update loan installment
    loan.emi = remainingBalance;
    await loan.save();

    res.json({ message: 'Payment successful', remainingBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint to view loan statement by customer_id and loan_id
app.get('/view-statement/:customer_id/:loan_id', async (req, res) => {
  try {
    const { customer_id, loan_id } = req.params;

    const loan = await Loan.findById(loan_id);
    if (!loan || loan.customer_id.toString() !== customer_id) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Construct loan statement
    const statement = {
      customer_id: loan.customer_id,
      loan_id: loan._id,
      principal: loan.loan_amount,
      interest_rate: loan.interest_rate,
      amount_paid: loan.emi,
      monthly_installment: loan.emi,
      repayments_left: 0 // Assuming no repayments left as the loan has been paid off
    };

    res.json([statement]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Helper function to calculate monthly installment
function calculateMonthlyInstallment(loanAmount, tenure, interestRate) {
  const monthlyInterestRate = interestRate / 1200; // Convert annual interest rate to monthly
  const denominator = Math.pow(1 + monthlyInterestRate, tenure) - 1;
  const emi = loanAmount * monthlyInterestRate / denominator;
  return emi;
}

// Helper function to check eligibility
async function checkEligibility(customer_id) {
  // Implement logic to check eligibility (similar to /check-eligibility endpoint)
}



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
