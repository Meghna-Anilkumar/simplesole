function generateReferralCode() {
    const digits = '0123456789';
    let referralCode = '';
    for (let i = 0; i < 6; i++) {
      referralCode += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return referralCode;
  }

  module.exports={
    generateReferralCode
  }