const bcrypt = require('bcryptjs');

async function filterRequestAndResponse(reArr, reBody) {
  if (reArr.length > 0) {
    const result ={};
    reArr.map((req) => {
      result[req] = reBody[req];
    })
    return result;
  }
  return;
}

async function   bcryptHash (password) {
  const hashedPassword = await bcrypt.hash(password,10)
  return hashedPassword
}

async function bcryptCompare (plain,hash) {
  const result = await bcrypt.compare(plain,hash)
  return result
}

// async function mergeAndSum(data) {
//   const BankNames = {};
//   const CashNames = {};
//   let BankTotal = 0;
//   let CashTotal = 0;

//   for (const [key, value] of Object.entries(data)) {
//     if (value.hasOwnProperty("BankNames")) {
//       for (const [bankName, bankValue] of Object.entries(value.BankNames)) {
//         if (BankNames.hasOwnProperty(bankName)) {
//           BankNames[bankName] += bankValue;
//         } else {
//           BankNames[bankName] = bankValue;
//         }
//       }
//     }

//     if (value.hasOwnProperty("CashNames")) {
//       for (const [cashName, cashValue] of Object.entries(value.CashNames)) {
//         if (CashNames.hasOwnProperty(cashName)) {
//           CashNames[cashName] += cashValue;
//         } else {
//           CashNames[cashName] = cashValue;
//         }
//       }
//     }

//     if (value.hasOwnProperty("BankTotal")) {
//       BankTotal += value.BankTotal;
//     }

//     if (value.hasOwnProperty("CashTotal")) {
//       CashTotal += value.CashTotal;
//     }
//   }

//   return {
//     BankNames,
//     CashNames,
//     BankTotal,
//     CashTotal,
//   };
// }

async function mergeAndSum(data) {
  const BankNames = {};
  const CashNames = {};
  let BankTotal = 0;
  let CashTotal = 0;

  for (const value of Object.values(data)) {
    if (value.BankNames) {
      for (const [bankName, bankValue] of Object.entries(value.BankNames)) {
        BankNames[bankName] = (BankNames[bankName] || 0) + bankValue;
      }
    }

    if (value.CashNames) {
      for (const [cashName, cashValue] of Object.entries(value.CashNames)) {
        CashNames[cashName] = (CashNames[cashName] || 0) + cashValue;
      }
    }

    BankTotal += value.BankTotal || 0;
    CashTotal += value.CashTotal || 0;
  }

  return {
    BankNames,
    CashNames,
    BankTotal,
    CashTotal,
  };
}


module.exports = { bcryptHash,bcryptCompare,filterRequestAndResponse, mergeAndSum };
