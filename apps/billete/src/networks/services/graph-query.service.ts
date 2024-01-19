import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GraphQueryService {
  private readonly queryUrl =
    'https://api.studio.thegraph.com/query/54135/goerli-testnet-5/0.0.4';

  async querySubgraph(query: string): Promise<any> {
    try {
      const response = await axios.post(this.queryUrl, { query });
      return response.data;
    } catch (error) {
      console.error('Error querying the subgraph:', error);
      throw error;
    }
  }
}
