import { gql } from '@apollo/client';

export const GET_ME = gql`
query Query
  {
    me{
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        image
        link
        title
        description
      }
    }
  }
`;
