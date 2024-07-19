const PROFILE_CHALLENGES = `
query MyQuery($address: String!) {
  challengeTally:challenges(where: {userAddress: $address}) {
  id
  }
  successChallenge:challenges(where: {userAddress: $address, status:false, success:1}) {
  id
  }
  failedChallenge:challenges(where: {userAddress: $address, status:false, success:0}) {
  stakedAmount
  }
  user:users(where: {userAddress: $address, status:true}){
  stakedAmount
  }
}
`;

const CREATE_CHALLENGES = `
query MyQuery($address: String!) {
  challenge:challenges(where: {userAddress: $address, status:true, success:2}) {
  objective
  startingMiles
  numberOfWeeks
  stakedAmount
  defaultAddress
  nextIntervalReviewEpoch
  success
  status
  createdAt
  reviews {
   status
   createdAt
  }
  }
}
`;

export { PROFILE_CHALLENGES, CREATE_CHALLENGES };
