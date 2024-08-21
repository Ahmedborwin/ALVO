const PROFILE_DATA_QUERY = `
query MyQuery($address: String!) {
  challengeTally:challenges(where: {userAddress: $address}) {
  id
  }
  successChallenge:challenges(where: {userAddress: $address, status:false, success:1}) {
  id
  }
  failedChallenge:challenges(where: {userAddress: $address, status:false, success:0}) {
  ERC20Address
  stakedAmount
  }
  user:users(where: {userAddress: $address, status:true}){
  stakedAmount
  stakedTokens
  }
}
`;

const CHALLENGES_CREATED_QUERY = `
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
  ERC20Address
  createdAt
  reviews {
   status
   createdAt
  }
  }
}
`;

export { PROFILE_DATA_QUERY, CHALLENGES_CREATED_QUERY };
