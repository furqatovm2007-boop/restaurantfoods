// Owner-requested cleanup of the retired hosting-login profile. Never merge
// identities by email alone or delete profiles that have business records.
export const legacyAccountCleanup = `DELETE FROM accounts
WHERE id='Aj7M34prFtIsh8HqbzEYO9I8XpukSMGYqPtsv91clm1wjeTE6CoW8i'
AND email='furqatovm2007@gmail.com'
AND EXISTS (SELECT 1 FROM accounts WHERE id='sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe' AND email='furqatovm2007@gmail.com')
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE owner_id=accounts.id)
AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id=accounts.id)
AND NOT EXISTS (SELECT 1 FROM bookings WHERE user_id=accounts.id)
AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id=accounts.id)`;

export function isReplacementAdmin(user: {userId:string;role:string}) {
  return user.role==='admin' && user.userId==='sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe';
}
