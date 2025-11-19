import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async (req: Request) => {
  // Configura o Mercado Pago
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
  });

  const preference = new Preference(client);

  try {
    // Se for uma requisição OPTIONS (pre-flight do navegador), responde OK
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }

    const body = await req.json();
    const { items, shippingCost } = body;

    const mpItems = items.map((item: any) => ({
      id: item.id.toString(),
      title: `${item.name} - Tam: ${item.selectedSize}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
    }));

    if (shippingCost > 0) {
      mpItems.push({
        id: 'ship',
        title: 'Frete / Entrega',
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: 'BRL',
      });
    }

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: "https://ravas7.github.io/C-R-STREET/", // Ajusta para o teu site
          failure: "https://ravas7.github.io/C-R-STREET/",
          pending: "https://ravas7.github.io/C-R-STREET/",
        },
        auto_return: "approved",
      }
    });

    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao criar pagamento" }), { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
};
