const admin = require("../config/firebaseAdmin");

async function makeAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    admin: true
  });

  console.log(`✅ User ${uid} is now an admin`);
}

makeAdmin("UUWrNuqmOhYW9ijn2vSH5l4V53W2");
