export const handler = async (event: any = {}): Promise<any> => {
  console.log(JSON.stringify(event.Records[0]));
};
