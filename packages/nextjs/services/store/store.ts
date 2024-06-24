import { StateCreator, create } from "zustand";
import { PersistOptions, createJSONStorage, persist } from "zustand/middleware";
import scaffoldConfig from "~~/scaffold.config";
import { Athlete, StravaRefreshTokenResponse, StravaState, StravaTokenResponse } from "~~/types/utils";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";
import { filterStravaResponse, reInitializeStravaData } from "~~/utils/strava";

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
}));

export const useStravaState = create<StravaState>(
  persist<StravaState>(
    (set, get) => ({
      userData: {
        access_token: null,
        athlete: {
          bio: null,
          city: null,
          country: null,
          firstname: null,
          id: null,
          lastname: null,
          premium: null,
          profile: null,
          profile_medium: null,
          sex: null,
          state: null,
          summit: null,
          username: null,
        },
        expires_at: null,
        expires_in: null,
        refresh_token: null,
      },
      setUserData: (data: StravaTokenResponse) =>
        set(state => ({ ...state, userData: filterStravaResponse(state.userData, data) })),
      clearUserData: () => set(state => ({ ...state, userData: reInitializeStravaData(state.userData) })),
      updateTokens: ({ access_token, expires_at, expires_in, refresh_token }: StravaRefreshTokenResponse) =>
        set(state => {
          state.userData.access_token = access_token;
          state.userData.refresh_token = refresh_token;
          state.userData.expires_at = expires_at;
          state.userData.expires_in = expires_in;
          return state;
        }),
      getStravaTokens: (): StravaRefreshTokenResponse => {
        return {
          access_token: get().userData.access_token,
          refresh_token: get().userData.refresh_token,
          expires_at: get().userData.expires_at,
          expires_in: get().userData.expires_in,
        } as StravaRefreshTokenResponse;
      },
      getStravaProfile: (): Athlete => get().userData.athlete as Athlete,
    }),
    {
      name: "strava-data",
      storage: createJSONStorage(() => localStorage),
    } as PersistOptions<StravaState>,
  ) as StateCreator<StravaState>,
);
