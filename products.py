"""Product copy and identity transcribed from the supplied Figma design."""
from html import escape

PRODUCTS = [
    dict(slug='petmais', name='Petmais', color='#f5892a', tint='#fff6ee', ink='#934600',
         short='Cuidado para quem também faz parte da família.',
         title='Quem faz parte da família também merece cuidado.',
         description='Seu pet está presente nos melhores momentos da sua vida. Por isso, o Pet Mais reúne serviços e benefícios pensados para ajudar você a cuidar melhor de quem está sempre ao seu lado.',
         alt='Pessoa abraçando seu cachorro com carinho',
         benefits=['Benefícios em clínicas veterinárias parceiras', 'Descontos em consultas e serviços', 'Vantagens em pet shops parceiros', 'Apoio para o cuidado do seu pet', 'Rede de parceiros especializados']),
    dict(slug='supramed', name='Supramed', color='#2abdb5', tint='#ecfbf9', ink='#126660',
         short='Mais acesso a serviços de saúde.',
         title='Mais acesso à saúde para você e sua família.',
         description='A Supramed amplia o acesso a serviços de saúde por meio de uma rede de profissionais e estabelecimentos parceiros. Uma solução pensada para tornar o cuidado mais acessível, simples e próximo da sua rotina.',
         alt='Profissional de saúde conversando com paciente em ambiente acolhedor',
         benefits=['Rede de profissionais parceiros', 'Acesso facilitado a serviços de saúde', 'Condições especiais em consultas', 'Atendimento em diferentes especialidades', 'Benefícios para você e sua família']),
    dict(slug='memorialmais', name='Memorialmais', color='#7b4fbe', tint='#f3edfb', ink='#663da3',
         short='Acolhimento nos momentos delicados.',
         title='Cuidado e acolhimento nos momentos que mais importam.',
         description='Em momentos delicados, contar com apoio faz toda a diferença. O Memorial Mais oferece estrutura, assistência e acolhimento para ajudar famílias a atravessarem momentos difíceis com mais tranquilidade e respeito.',
         alt='Família unida transmitindo acolhimento e serenidade',
         benefits=['Estrutura especializada', 'Atendimento humanizado', 'Assistência funerária completa', 'Suporte para a família', 'Serviços e facilidades em um só lugar']),
    dict(slug='clubemais', name='Clubemais', color='#e8507a', tint='#fff0f5', ink='#b22950',
         short='Benefícios e vantagens para o seu dia a dia.',
         title='Benefícios que acompanham você todos os dias.',
         description='Ser Plano Mais também significa ter acesso a oportunidades e vantagens no dia a dia. No Clube Mais, você encontra benefícios e condições especiais em uma rede de parceiros em constante expansão.',
         alt='Mãe e filha aproveitando uma visita a uma cafeteria de bairro',
         benefits=['Descontos em estabelecimentos parceiros', 'Ofertas exclusivas', 'Benefícios para lazer e serviços', 'Vantagens para toda a família', 'Rede de parceiros em expansão']),
]

def theme(product):
    button_text = '#ffffff' if product['slug'] in ('memorialmais', 'mais') else '#172033'
    return f'--product-color:{product["color"]};--product-tint:{product["tint"]};--product-ink:{product["ink"]};--product-button-text:{button_text}'

def product_navigation(route):
    links = ''.join(f'<a href="/produtos/{p["slug"]}/" style="{theme(p)}" '+
                    ('aria-current="page" ' if route == 'produtos/'+p['slug'] else '')+
                    f'><span class="product-dot" aria-hidden="true"></span>{p["name"]}</a>' for p in PRODUCTS)
    return '<details class="products-nav"><summary>Produtos</summary><div class="products-menu"><a class="products-menu-all" href="/#produtos">Todos os produtos <span aria-hidden="true">↗</span></a>'+links+'</div></details>'

def product_footer():
    return ''.join(f'<a href="/produtos/{p["slug"]}/">{p["name"]}</a>' for p in PRODUCTS)

def product_overview(exclude=None):
    main = dict(slug='mais', name='Mais Assistencial', color='#1a3ea8', tint='#eef3ff', ink='#1a3ea8', short='Assistência para você e sua família.')
    products = ([main] if not exclude else []) + [p for p in PRODUCTS if p['slug'] != exclude]
    cards = ''
    for p in products:
        href = '/#planos' if p['slug'] == 'mais' else f'/produtos/{p["slug"]}/'
        cards += f'''<a class="product-card" href="{href}" style="{theme(p)}" aria-label="Conheça {p['name']}">
          <span class="product-icon"><img src="/assets/products/{p['slug']}-icon.svg" width="26" height="26" alt=""></span>
          <img class="product-logo" src="/assets/products/{p['slug']}-logo.png" width="140" height="40" alt="{p['name']}" loading="lazy">
          <p>{p['short']}</p><span class="product-card-link">Conheça <span aria-hidden="true">↗</span></span></a>'''
    title = 'Mais formas de cuidar.' if exclude else 'Um ecossistema pensado para cuidar de você por inteiro.'
    section_id = 'outros-produtos' if exclude else 'produtos'
    return f'''<section class="section product-overview" id="{section_id}" aria-labelledby="{section_id}-title"><div class="wrap">
      <div class="heading product-section-heading"><div><div class="eyebrow">{'EXPLORE TAMBÉM' if exclude else 'TUDO CONECTADO'}</div><h2 id="{section_id}-title">{title}</h2></div><p class="muted">Soluções que se complementam para estar perto de você e de quem faz parte da sua vida.</p></div>
      <div class="product-grid {'product-grid-related' if exclude else ''}">{cards}</div></div></section>'''

def product_page(p, button):
    benefits = ''.join(f'<li><span class="product-benefit-icon"><img src="/assets/products/check.svg" width="24" height="24" alt=""></span><span>{escape(text)}</span></li>' for text in p['benefits'])
    return f'''<div class="product-detail" style="{theme(p)}">
      <div class="wrap product-breadcrumb"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/#produtos">Produtos</a><span aria-hidden="true">/</span><span>{p['name']}</span></div>
      <section class="wrap product-hero" aria-labelledby="product-title"><div class="product-hero-copy">
        <img class="product-hero-logo" src="/assets/products/{p['slug']}-logo.png" width="180" height="60" alt="{p['name']}">
        <div class="eyebrow">{p['name']} · PLANO MAIS</div><h1 id="product-title">{p['title']}</h1><p>{p['description']}</p>
        {button('Fale com a equipe', 'tel:08000955651', 'product-button')}<a class="product-secondary" href="#beneficios-produto">Explore os benefícios <span aria-hidden="true">↓</span></a>
        </div><div class="product-hero-visual"><img class="product-photo" src="/assets/products/{'memorialmais-editorial.webp' if p['slug'] == 'memorialmais' else (p['slug'] + '-photo.webp' if p['slug'] in {'petmais','supramed','clubemais'} else p['slug'] + '-photo.png')}" alt="{p['alt']}" width="1122" height="1402" fetchpriority="high"><span class="product-photo-stamp"><img src="/assets/products/{p['slug']}-icon.svg" width="32" height="32" alt=""></span></div></section>
      <section class="section wrap product-benefits" id="beneficios-produto" aria-labelledby="product-benefits-title"><div><div class="eyebrow">BENEFÍCIOS {p['name'].upper()}</div><h2 id="product-benefits-title">{p['short']}</h2><p class="muted">Conheça as possibilidades e converse com a equipe sobre o atendimento na sua região.</p></div><ul>{benefits}</ul></section>
      <section class="wrap product-contact"><div><div class="eyebrow">VAMOS CONVERSAR</div><h2>Saiba mais sobre {p['name']}.</h2><p>A equipe Mais ajuda você a conhecer os serviços, a rede disponível e as condições de utilização.</p></div><div><a class="product-phone" href="tel:08000955651">0800 095 5651 <span aria-hidden="true">↗</span></a><p>Segunda a sexta, das 8h às 20h.</p></div></section>
      </div>''' + product_overview(exclude=p['slug'])
