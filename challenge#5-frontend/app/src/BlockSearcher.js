import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Label, Icon } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const [query, setQuery] = useState();
  const [block, setBlock] = useState({hash: null});

  const getBlock = api.rpc.chain.getBlock;
  const getBlockHash = api.rpc.chain.getBlockHash;

  const onChange = (_, data) => {
    setQuery(data.value);
  }

  const onSubmit = () => {
    async function fetchData(query) {
      const hash = /^[0-9]+$/.test(query) ? await getBlockHash(query) : query;
      const result = await getBlock(hash);
      setBlock({hash: result.block.header.hash.toHex()});
    }
    setBlock({hash:null});
    if(query) fetchData(query);
  };

  return (
    <Grid.Column>
      <h1>Block Searcher</h1>
      <Form style={{overflowX: 'auto'}} inline onSubmit={onSubmit}>
        <Form.Field>
          <Input
            fluid
            label='Hash or Number'
            type='string'
            state='query'
            value={query}
            onChange={onChange}
          />
          <Input type="submit" value="Submit" />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center'}}>
        <label>Searched Block Hash</label>{block.hash}
        </Form.Field>
      </Form>
    </Grid.Column>
  );
}

export default function BlockSearcher(props) {
  const { api } = useSubstrate();
  return api.rpc && 
    api.rpc.chain &&
    api.rpc.chain.getBlock &&
    api.rpc.chain.getBlockHash ? (
      <Main {...props} />
    ) : null;
}


