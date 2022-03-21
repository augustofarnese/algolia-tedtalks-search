const { algoliasearch, instantsearch } = window;
const aa = require('search-insights');

const insightsMiddleware = instantsearch.middlewares.createInsightsMiddleware({
  insightsClient: aa,
});

function getAPIKey(){
  return '40fa3f7dd7bf32289eeb0c7628c4e141';
}


const searchClient = algoliasearch(
  '1H5L92KVH1',
  getAPIKey(),
);



aa('init', {
  appId: '1H5L92KVH1',
  apiKey: '40fa3f7dd7bf32289eeb0c7628c4e141',
  useCookie: true,
})

const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'navbar',
  transformSource({ source }) {
    return {
      ...source,
      getItemUrl({ item }) {
        return `/search?q=${item.query}`;
      },
      templates: {

        header() {
          return 'Recently Searched';
        },
        item( params ){
          const { item, createElement } = params;
          // console.log('-->>');
          // console.log(item);
          return createElement(
            'a',
            {
              className: 'aa-ItemLink',
              href: `/?talks%5Bquery%5D=${item.label}`,
            },
            source.templates.item(params)
          );
        }
      },
    };
  },
});

const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: 'talks_query_suggestions',

  transformSource({ source }) {
    return {
      ...source,
      getItemUrl({ item }) {
        return `/search?q=${item.query}`;
      },
      templates: {

        header() {
          return 'Suggestion';
        },
        item( params ){
          const { item, createElement } = params;
          return createElement(
            'a',
            {
              className: 'aa-ItemLink',
              href: `/?talks%5Bquery%5D=${item.query}`,
            },
            source.templates.item(params)
          );
        }
      },
      // onSelect({ item }) {
      //   // Assuming the refine function updates the search page state.
      //   alert(item.query);
      // },
    };
  },
  // getSearchParams() {
  //   return recentSearches.data.getAlgoliaSearchParams();
  // },
});

const autocompleteSearch = autocomplete({
  container: '#autocomplete',
  plugins: [recentSearchesPlugin, querySuggestionsPlugin],
  openOnFocus: true,
  placeholder: "Search for videos, speakers or events",
  debug: true,
  classNames: {
    form: " relative rounded-md shadow-sm",
    input: "rounded-md uniqueClassForMyInputAutocomplete",
    list: "grid grid-cols-1 gap-4 sm:grid-cols-3",
  },
  onStateChange({ state }) {
    // console.log(state);
  },
  getSources({ query }) {
    return [
      {
        sourceId: 'talks',
        getItemInputValue: ({ item }) => item.query,
        classNames: "testeteste",
        getItemUrl({ item }) {
          return `/search?q=${item.query}`;
        },
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: 'talks',
                query,
                params: {
                  hitsPerPage: 3,
                },
              },
            ],
          });
        },
        templates: {
          header() {
            return 'TED Talks';
          },

          item({ item, components, createElement }) {
            return createElement('div', {
              dangerouslySetInnerHTML: {
                __html: `<li class="col-span-1 flex shadow-sm rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center w-16 bg-pink-600 text-white text-sm font-medium rounded-l-md" style="background: url('${item.image_url}');background-size: cover;"></div>
                              <div class="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md text-ellipsis overflow-hidden">
                                <div class="flex-1 px-4 py-2 text-sm text-ellipsis overflow-hidden">
                                  <a href="#" onClick="javascript:mostraModal(${item.objectID})"  class="text-gray-900 font-medium hover:text-gray-600 text-ellipsis overflow-hidden">${item.name}</a>
                                  <!-- <p class="text-gray-500 text-ellipsis overflow-hidden">${item.description}</p> -->
                                </div>
                              </div>
                          </li>`,
              },
            });
          },
          // footer() {
          //   return 'I have no more suggestions';
          // },
        },
      },
      {
        sourceId: 'speakers',
        getItemInputValue: ({ item }) => item.query,
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: 'speakers',
                query,
                params: {
                  hitsPerPage: 3,
                },
              },
            ],
          });
        },
        templates: {
          header() {
            return 'Speakers';
          },
          item({ item, components, createElement }) {
            return createElement('div', {
              dangerouslySetInnerHTML: {
                __html: `  <div class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <div class="flex-shrink-0">
                        <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/50?u=${item.name.replace(/\s/g, '')}" alt="">
                      </div>
                      <div class="flex-1 min-w-0">
                        <a href="/?talks%5Bmenu%5D%5Bspeakers%5D=${item.name}" class="focus:outline-none">
                          <span class="absolute inset-0" aria-hidden="true"></span>
                          <p class="text-sm font-medium text-gray-900">${item.name}</p>
                          <p class="text-sm text-gray-500 truncate">Co-Founder / CEO</p>
                        </a>
                      </div>
                    </div>`,
              },
            });
          },
          // footer() {
          //   return 'I have no more suggestions';
          // },
        },
      },
      // {
      //   sourceId: 'talks',
      //   getItems() {
      //     return  getAlgoliaResults({
      //       searchClient,
      //       queries: [
      //         {
      //           indexName: 'talks',
      //           query,
      //           params: {
      //             hitsPerPage: 5,
      //           },
      //         },
      //       ],
      //     });
      //   },
      // }
    ];
  },
});

const search = instantsearch({
  indexName: 'talks',
  searchClient,
  routing: true,
});

search.use(insightsMiddleware)

const renderSearchBox = (renderOptions, isFirstRender) => {
    const {
     query, refine
   } = renderOptions;

   const input = document.querySelector('#mysearchbox');

   if (isFirstRender) {

     input.addEventListener('input', event => {
       //Start searching after 3 characters
       // if(event.target.value.length >= '3') {
         refine(event.target.value);
       // }
       // else refine('')
     });

    input.value = query;

  }

};

const customSearchBox = instantsearch.connectors.connectSearchBox(
  renderSearchBox
);


const renderPagination = (renderOptions, isFirstRender) => {
  const {
    pages, currentRefinement, refine, isFirstPage, isLastPage
  } = renderOptions;

  const container = document.querySelector('#customPagination');
  //console.log(pages)


  container.innerHTML = `
    <nav class="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0 mb-5">
      <div class="-mt-px w-0 flex-1 flex ${isFirstPage ? "invisible" : "visible"}">
        <a href="#" data-value="${currentRefinement - 1}" class="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
          <!-- Heroicon name: solid/arrow-narrow-left -->
          <svg class="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Previous
        </a>
      </div>
      <div class="hidden md:-mt-px md:flex">
        ${pages
          .map(
            page => `

            <a href="#" class= aria-current="page">

            </a>

            <a
            href="#"
            data-value="${page}"
            class= ${currentRefinement === page ? '"border-indigo-500 text-indigo-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"' : '"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"'}>
              ${page + 1}
            </a>
            `
          )
          .join('')}
          </div>
          <div class="-mt-px w-0 flex-1 flex justify-end ${isLastPage ? "invisible" : "visible"}">
            <a href="#" data-value="${currentRefinement + 1}" class="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Next
              <!-- Heroicon name: solid/arrow-narrow-right -->
              <svg class="ml-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </nav>
    `;

    [...container.querySelectorAll('a')].forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        refine(event.currentTarget.dataset.value);
      });
    });

};




const customPagination = instantsearch.connectors.connectPagination(
  renderPagination
);

const renderMenuSelectSpeakers = (renderOptions, isFirstRender) => {
  // Rendering logic
  const { items, refine } = renderOptions;

  const $container = $('#customMenuSelectSpeakers');

  if(isFirstRender) {
    $container.append(`<div>
      <label id="listbox-label" class="block text-sm font-medium text-gray-700"> Speaker </label>
      <div class="mt-1 relative">
        <button id="speakers-facet-btn" type="button" class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
          <span class="flex items-center">
            <img id="selectedSpeakerImage" src="" alt="" class="flex-shrink-0 h-6 w-6 rounded-full hidden">
            <span class="ml-3 block truncate" id="selectedSpeakerLabel">  </span>
          </span>
          <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <!-- Heroicon name: solid/selector -->
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
        <ul id="speakers-popover" class="hidden absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
        </ul>
      </div>`);

      $("#speakers-facet-btn").click(function(){
        $("#speakers-popover").toggle();
      });
  }

  $('#selectedSpeakerImage').hide().attr('src','');
  $('#selectedSpeakerLabel').text('Select Speaker');

  $container.find('ul').html('');

  $(items).each(function(index){
    var item = items[index];

    $container.find('ul').append(`<li facet-value="${item.value}" class="${item.isRefined ? 'text-white bg-indigo-600 cursor-default' : 'text-gray-900 cursor-pointer'} customSelectItem select-none relative py-2 pl-3 pr-9" id="listbox-option-0" role="option">
                <div class="flex items-center">
                  <img src="https://i.pravatar.cc/50?u=${item.label.replace(/\s/g, '')}" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
                  <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                  <span class="font-normal ml-3 block truncate"> ${item.label} </span>
                </div>
                ${item.isRefined ? '<span class="text-white absolute inset-y-0 right-0 flex items-center pr-4"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />          </svg>        </span>' : ''}
                </li>`);

    if(item.isRefined){
      $('#selectedSpeakerImage').show().attr('src',"https://i.pravatar.cc/50?u=" + item.label.replace(/\s/g, ''));
      $('#selectedSpeakerLabel').text(item.label)
    }
  });

    $('.customSelectItem').click(function(){
      refine($(this).attr("facet-value"));
      $('#selectedSpeakerImage').attr("src",$(this).find('img').attr('src'));
      // console.log($(this).find('img').attr('src'));
      $("#speakers-popover").hide();
    });


//
//   container.innerHTML = `
//   <div>
//   <label id="listbox-label" class="block text-sm font-medium text-gray-700"> Speaker </label>
//   <div class="mt-1 relative">
//     <button type="button" class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
//       <span class="flex items-center">
//         <img id="selectedSpeakerImage" src="" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
//         <span class="ml-3 block truncate" id="selectedSpeakerLabel"> </span>
//       </span>
//       <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//         <!-- Heroicon name: solid/selector -->
//         <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//           <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
//         </svg>
//       </span>
//     </button>
//
//     <!--
//       Select popover, show/hide based on select state.
//
//       Entering: ""
//         From: ""
//         To: ""
//       Leaving: "transition ease-in duration-100"
//         From: "opacity-100"
//         To: "opacity-0"
//     -->
//
//       <!--
//         Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.
//
//         Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
//       -->
//       ${items
//         // .map(item => `<option value="${item.value}"></option>`)
//         .map(item => `<li facet-value="${item.value}" class="${item.isRefined ? 'text-white bg-indigo-600' : 'text-gray-900'} customSelectItem cursor-default select-none relative py-2 pl-3 pr-9" id="listbox-option-0" role="option">
//             <div class="flex items-center">
//               <img src="https://i.pravatar.cc/50?u=${item.label.replace(/\s/g, '')}" alt="" class="flex-shrink-0 h-6 w-6 rounded-full">
//               <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
//               <span class="font-normal ml-3 block truncate"> ${item.label} </span>
//             </div>
//             ${item.isRefined ? '<span class="text-white absolute inset-y-0 right-0 flex items-center pr-4"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />          </svg>        </span>' : ''}
//             </li>`)
//         .join('')}
//
//
//       <!-- More items... -->
//     </ul>
//   </div>
// </div>
// `;
//   console.log(`passei`);
//   $('.customSelectItem').click(function(){
//     refine($(this).attr("facet-value"));
//     $('#selectedSpeakerImage').attr("src",$(this).find('img').attr('src'));
//     console.log($(this).find('img').attr('src'));
//   });

};

const customMenuSelectSpeakers = instantsearch.connectors.connectMenu(
  renderMenuSelectSpeakers
);

search.addWidgets([
  customSearchBox({
    container: '#searchbox',
    showSubmit: true,
    autofocus: true,
  }),
  customMenuSelectSpeakers({
    container: '#customMenuSelectSpeakers',
    attribute: 'speakers',
  }),
  customPagination({
    container: '#customPagination',
  }),
  instantsearch.widgets.sortBy({
    container: '#sort-by',
    items: [
      { label: 'Default', value: 'talks' },
      { label: 'Most viewed', value: 'talks_viewed_count_desc' },
      { label: 'Beautiful Rating', value: 'talks_beautiful_rating_desc' },
    ],
    cssClasses: {
      root: 'absolute inset-y-0 right-0 flex items-center',
      select: 'focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md',
    },
  }),
  instantsearch.widgets.menuSelect({
    container: "#event",
    attribute: "event_name",
    cssClasses: {
      select: 'mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md',
    },
    templates: {
      defaultOption: 'Filter by event',
    },
  }),
  instantsearch.widgets.clearRefinements({
    container: '#clear-refinements',
    cssClasses: {
      button: 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    },
  }),
  instantsearch.widgets.queryRuleCustomData({
    container: '#banner',
    templates: {
      default: `
      {{#items}}
          <div class="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
            <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div class="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
                <div class="flex items-center justify-between flex-wrap">
                  <div class="w-0 flex-1 flex items-center">
                    <span class="flex p-2 rounded-lg bg-indigo-800">
                      <!-- Heroicon name: outline/speakerphone -->
                      <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </span>
                    <p class="ml-3 font-medium text-white truncate">{{message}}</p>
                  </div>
                  <div class="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                    <a href="#" class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"> Learn more </a>
                  </div>
                  <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                    <button type="button" class="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white">
                      <span class="sr-only">Dismiss</span>
                      <!-- Heroicon name: outline/x -->
                      <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {{/items}}
      `,
    },
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    cssClasses: {
      list:   "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 ",
      item: "h-96 text-ellipsis overflow-hidden relative"
    },
    templates: {
      item(hit, bindEvent){
        return  `
            <a ${bindEvent('click', hit, 'Product Added')} onClick="javascript:mostraModal(${hit.objectID})" href="#">
            <div class="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
              <img src="${hit.image_url}" alt="" class="object-cover pointer-events-none group-hover:opacity-75">
            </div>
            <p class="mt-2 block text-sm font-medium text-gray-500 pointer-events-none">${hit.speakers}</p>
            <p class="block text-lg font-medium text-gray-900 pointer-events-none">${instantsearch.highlight({ attribute: 'name', hit })}</p>
            <div>
              <p class="text-sm text-gray-500 pointer-events-none">${instantsearch.highlight({ attribute: 'description', hit })} </p>
            </div>
              </button>


        `

        /*`
        <article>
                  <div> <img style="width:100%" src=" ${hit.image_url}  "/></div>
                  <div class="author">${instantsearch.highlight({ attribute: 'speakers', hit })} </div>
                  <h3 class="title">${instantsearch.highlight({ attribute: 'name', hit })}  </h3>
                  <p class="description">${instantsearch.highlight({ attribute: 'description', hit })} </p>
        <button
                type="button"
                ${bindEvent('click', hit, 'Product Added')}
              >
              Watch
              </button>
      </article>
      `*/
      },
    },
  }),
  //
  // instantsearch.widgets.refinementList({
  //   container: '#refinementList_Test',
  //   attribute: 'speakers',
  // }),
  //



  //
  // instantsearch.widgets.dynamicWidgets({
  //   container: '#dynamic-widgets',
  //   facets: ['*'],
  //
  //   widgets: [
  //     (container) =>
  //     instantsearch.widgets.menuSelect({
  //       container,
  //       attribute: 'event_name',
  //     }),
  //
  //     // (container) =>
  //     //   instantsearch.widgets.menuSelect({
  //     //     container,
  //     //     attribute: 'speakers',
  //     //     sortBy: ['name:asc'],
  //     //   }),
  //
  //       // (container) =>
  //       // instantsearch.widgets.refinementList({
  //       //   container,
  //       //   attribute: 'speakers',
  //       // }),
  //   ],
  //   fallbackWidget({ container, attribute }) {
  //     return instantsearch.widgets.refinementList({
  //       container,
  //       attribute,
  //     });
  //   },
  // }),


]);

search.start();
