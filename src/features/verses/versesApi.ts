import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { Verse } from './Verse'

export const versesApi = createApi({
  reducerPath: 'versesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/verses' }),
  tagTypes: ['Verse'],
  endpoints: (builder) => ({
    getVerses: builder.query<Verse[], void>({
      query: () => '',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Verse' as const, id })),
              { type: 'Verse' as const, id: 'LIST' },
            ]
          : [{ type: 'Verse' as const, id: 'LIST' }],
    }),

    getVerse: builder.query<Verse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Verse', id }],
    }),

    addVerse: builder.mutation<Verse, Partial<Verse>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Verse', id: 'LIST' }],
    }),

    updateVerse: builder.mutation<Verse, Pick<Verse, 'id'> & Partial<Verse>>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Verse', id }],
    }),

    deleteVerse: builder.mutation<Verse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Verse', id: 'LIST' }],
    }),

    shuffleVerses: builder.mutation<Verse[], void>({
      query: () => ({
        url: '/shuffle',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Verse', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetVersesQuery,
  useGetVerseQuery,
  useAddVerseMutation,
  useUpdateVerseMutation,
  useDeleteVerseMutation,
  useShuffleVersesMutation,
} = versesApi
